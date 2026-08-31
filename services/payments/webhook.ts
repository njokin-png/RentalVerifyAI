import "server-only";
import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const id = (value: string | { id: string } | null) =>
  typeof value === "string" ? value : value?.id;

export async function processStripeEvent(event: Stripe.Event) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.stripeEvent.create({ data: { id: event.id, type: event.type } });
      if (
        event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded"
      ) {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;
        const plan = session.metadata?.plan;
        if (!userId || !["report", "pro"].includes(plan || ""))
          throw new Error("Checkout metadata is invalid.");
        const customerId = id(session.customer);
        if (customerId)
          await tx.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
          });
        if (plan === "report") {
          if (session.payment_status !== "paid" || !session.metadata?.scanId)
            return;
          await tx.payment.upsert({
            where: { checkoutSessionId: session.id },
            create: {
              userId,
              amount: session.amount_total || 499,
              currency: session.currency || "usd",
              status: "paid",
              providerId: id(session.payment_intent),
              checkoutSessionId: session.id,
              reportScanId: session.metadata.scanId,
            },
            update: {
              status: "paid",
              providerId: id(session.payment_intent),
              reportScanId: session.metadata.scanId,
            },
          });
        } else {
          const subscriptionId = id(session.subscription);
          if (!subscriptionId)
            throw new Error("Subscription identifier is missing.");
          await tx.subscription.upsert({
            where: { providerId: subscriptionId },
            create: {
              userId,
              plan: "pro",
              status: "active",
              providerId: subscriptionId,
              checkoutSessionId: session.id,
            },
            update: { userId, status: "active", checkoutSessionId: session.id },
          });
        }
      }
      if (
        [
          "customer.subscription.created",
          "customer.subscription.updated",
          "customer.subscription.deleted",
        ].includes(event.type)
      ) {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;
        if (!userId) throw new Error("Subscription metadata is invalid.");
        await tx.subscription.upsert({
          where: { providerId: subscription.id },
          create: {
            userId,
            plan: "pro",
            status: subscription.status,
            providerId: subscription.id,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          update: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
    });
    return { duplicate: false };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return { duplicate: true };
    throw error;
  }
}

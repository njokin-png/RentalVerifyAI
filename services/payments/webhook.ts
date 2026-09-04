import "server-only";
import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";

const id = (value: string | { id: string } | null) =>
  typeof value === "string" ? value : value?.id;

function isDuplicateStripeEvent(error: unknown) {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  )
    return false;
  const target = error.meta?.target;
  return (
    (Array.isArray(target) && target.length === 1 && target[0] === "id") ||
    (typeof target === "string" && target.includes("StripeEvent_pkey"))
  );
}

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
          if (
            session.payment_status !== "paid" ||
            session.amount_total !== PLANS.report.amount ||
            session.currency?.toLowerCase() !== "usd" ||
            !session.metadata?.scanId
          )
            throw new Error("Report payment details are invalid.");
          const ownedScan = await tx.rentalScan.findFirst({
            where: { id: session.metadata.scanId, userId },
            select: { id: true },
          });
          if (!ownedScan) throw new Error("Report scan ownership is invalid.");
          await tx.payment.upsert({
            where: { checkoutSessionId: session.id },
            create: {
              userId,
              amount: session.amount_total,
              currency: "usd",
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
              status: "pending",
              providerId: subscriptionId,
              checkoutSessionId: session.id,
            },
            update: { userId, checkoutSessionId: session.id },
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
    if (isDuplicateStripeEvent(error)) return { duplicate: true };
    throw error;
  }
}

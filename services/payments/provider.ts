import "server-only";
import Stripe from "stripe";
import { getStripeConfiguration } from "@/lib/env";
import type { PaidPlan } from "@/lib/plans";

export function stripeClient() {
  const configuration = getStripeConfiguration();
  return configuration ? new Stripe(configuration.secretKey) : null;
}

export async function createCheckout(input: {
  plan: PaidPlan;
  userId: string;
  email: string;
  scanId?: string;
  origin: string;
  customerId?: string | null;
}) {
  const configuration = getStripeConfiguration();
  const stripe = stripeClient();
  if (!configuration || !stripe) return null;
  const price =
    input.plan === "report"
      ? configuration.reportPriceId
      : configuration.proPriceId;
  return stripe.checkout.sessions.create({
    mode: input.plan === "report" ? "payment" : "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${input.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/checkout/cancel`,
    customer: input.customerId || undefined,
    customer_email: input.customerId ? undefined : input.email,
    client_reference_id: input.userId,
    metadata: {
      userId: input.userId,
      plan: input.plan,
      ...(input.scanId ? { scanId: input.scanId } : {}),
    },
    payment_intent_data:
      input.plan === "report"
        ? {
            metadata: {
              userId: input.userId,
              plan: input.plan,
              scanId: input.scanId!,
            },
          }
        : undefined,
    subscription_data:
      input.plan === "pro"
        ? { metadata: { userId: input.userId, plan: input.plan } }
        : undefined,
  });
}

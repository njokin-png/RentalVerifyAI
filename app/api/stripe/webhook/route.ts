import { NextResponse } from "next/server";
import { getStripeConfiguration } from "@/lib/env";
import { stripeClient } from "@/services/payments/provider";
import { processStripeEvent } from "@/services/payments/webhook";
import { recordSecurityEvent } from "@/lib/security-audit";

export async function POST(req: Request) {
  const configuration = getStripeConfiguration();
  const stripe = stripeClient();
  if (!configuration || !stripe) {
    recordSecurityEvent({ action: "stripe_webhook", outcome: "error" });
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    recordSecurityEvent({ action: "stripe_webhook", outcome: "rejected" });
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      configuration.webhookSecret,
    );
  } catch {
    recordSecurityEvent({ action: "stripe_webhook", outcome: "rejected" });
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }
  try {
    const result = await processStripeEvent(event);
    recordSecurityEvent({
      action: "stripe_webhook",
      outcome: result.duplicate ? "duplicate" : "success",
      providerEventType: event.type,
    });
    return NextResponse.json({ received: true });
  } catch {
    recordSecurityEvent({
      action: "stripe_webhook",
      outcome: "error",
      providerEventType: event.type,
    });
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}

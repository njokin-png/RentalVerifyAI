import { NextResponse } from "next/server";
import { getStripeConfiguration } from "@/lib/env";
import { stripeClient } from "@/services/payments/provider";
import { processStripeEvent } from "@/services/payments/webhook";

export async function POST(req: Request) {
  const configuration = getStripeConfiguration();
  const stripe = stripeClient();
  if (!configuration || !stripe)
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  const signature = req.headers.get("stripe-signature");
  if (!signature)
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      configuration.webhookSecret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }
  await processStripeEvent(event);
  return NextResponse.json({ received: true });
}

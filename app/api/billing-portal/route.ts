import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStripeConfiguration } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createCustomerPortal } from "@/services/payments/provider";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  if (!getStripeConfiguration())
    return NextResponse.json(
      { error: "Subscription management is not configured." },
      { status: 503 },
    );

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { stripeCustomerId: true },
  });
  if (!user)
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (!user.stripeCustomerId)
    return NextResponse.json(
      { error: "No subscription billing account was found." },
      { status: 409 },
    );

  const origin = new URL(process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin)
    .origin;
  const portal = await createCustomerPortal({
    customerId: user.stripeCustomerId,
    returnUrl: `${origin}/account`,
  });

  return portal?.url
    ? NextResponse.json({ url: portal.url })
    : NextResponse.json(
        { error: "Subscription management is temporarily unavailable." },
        { status: 503 },
      );
}

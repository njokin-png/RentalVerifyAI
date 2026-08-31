import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStripeConfiguration } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import type { PaidPlan } from "@/lib/plans";
import { createCheckout } from "@/services/payments/provider";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  if (!getStripeConfiguration())
    return NextResponse.json(
      { error: "Paid checkout is not configured." },
      { status: 503 },
    );
  const body = (await req.json().catch(() => null)) as {
    plan?: PaidPlan;
    scanId?: string;
  } | null;
  if (!body || !["report", "pro"].includes(body.plan || ""))
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  if (body.plan === "report") {
    if (!body.scanId)
      return NextResponse.json(
        { error: "A report scan is required." },
        { status: 400 },
      );
    const owned = await prisma.rentalScan.findFirst({
      where: { id: body.scanId, userId: session.userId },
      select: { id: true },
    });
    if (!owned)
      return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { stripeCustomerId: true },
  });
  if (!user)
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  const origin = new URL(process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin)
    .origin;
  const checkout = await createCheckout({
    plan: body.plan!,
    userId: session.userId,
    email: session.email,
    scanId: body.scanId,
    origin,
    customerId: user.stripeCustomerId,
  });
  return checkout?.url
    ? NextResponse.json({ url: checkout.url })
    : NextResponse.json(
        { error: "Paid checkout is unavailable." },
        { status: 503 },
      );
}

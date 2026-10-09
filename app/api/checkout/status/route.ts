import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { stripeClient } from "@/services/payments/provider";
import {
  canAccessPaidReport,
  hasActivePro,
} from "@/services/payments/entitlements";
import { getOwnedScan } from "@/services/scans/repository";

export async function GET(req: NextRequest) {
  const account = await getSession();
  if (!account)
    return NextResponse.json(
      { error: "Sign in to confirm your purchase." },
      { status: 401 },
    );
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId))
    return NextResponse.json(
      { error: "A valid checkout session is required." },
      { status: 400 },
    );
  const stripe = stripeClient();
  if (!stripe)
    return NextResponse.json(
      { error: "Payment confirmation is unavailable." },
      { status: 503 },
    );
  try {
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    if (checkout.metadata?.userId !== account.userId)
      return NextResponse.json(
        { error: "Checkout not found." },
        { status: 404 },
      );
    const plan = checkout.metadata?.plan;
    if (plan !== "report" && plan !== "pro")
      return NextResponse.json(
        { error: "Checkout not found." },
        { status: 404 },
      );
    const paid =
      checkout.status === "complete" && checkout.payment_status === "paid";
    let ready = false;
    let destination = "/account";
    if (paid && plan === "report" && checkout.metadata?.scanId) {
      const scanId = checkout.metadata.scanId;
      ready =
        Boolean(await getOwnedScan(scanId, account.userId)) &&
        (await canAccessPaidReport(account.userId, scanId));
      destination = `/report/${encodeURIComponent(scanId)}`;
    } else if (paid && plan === "pro") {
      ready = await hasActivePro(account.userId);
    }
    return NextResponse.json(
      {
        state: ready
          ? "ready"
          : checkout.status === "expired"
            ? "expired"
            : "pending",
        paid,
        plan,
        ...(ready ? { destination } : {}),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "We could not confirm this checkout yet. Please retry; do not pay again.",
      },
      { status: 503 },
    );
  }
}

import Link from "next/link";
import type { Metadata } from "next";
import { CheckoutButton } from "@/components/CheckoutButton";
import {
  getStripeConfiguration,
  getStripeConfigurationIssues,
} from "@/lib/env";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare free rental checks, one-time Rental Verify Reports, and RentalVerify AI Pro.",
  alternates: { canonical: "/pricing" },
};

const features = {
  free: [
    `${PLANS.free.monthlyScanLimit} basic scans per month`,
    "Listing and message warning signs",
    "Optional images (checks depend on provider availability)",
    "Score, check findings, gaps, and next steps",
    "Account scan history and deletion controls",
  ],
  report: [
    "Printable report for one existing scan",
    "The scan's findings, limitations, and next steps in one document",
    "Print or save as PDF using your browser",
    "One-time payment; no subscription",
  ],
  pro: [
    PLANS.pro.monthlyScanLimit === null
      ? "Unlimited scans"
      : `${PLANS.pro.monthlyScanLimit} scans per month`,
    "Printable report access for your scans while Pro is active",
    "Listing, message, and optional image analysis",
    "Same available checks; Pro does not guarantee additional data",
    "Renews monthly; manage cancellation from Account",
  ],
};

export default async function Pricing(props: {
  searchParams: Promise<{ scanId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const stripe = getStripeConfiguration();
  if (!stripe) {
    console.warn(
      `Stripe checkout disabled; invalid variables: ${getStripeConfigurationIssues().join(", ")}`,
    );
  }
  const configured = Boolean(stripe);
  const plans = [
    ["free", PLANS.free],
    ["report", PLANS.report],
    ["pro", PLANS.pro],
  ] as const;
  return (
    <div className="container py-16">
      <div className="text-center">
        <p className="eyebrow">CLEAR PRICING</p>
        <h1 className="text-4xl font-extrabold mt-2">
          Choose how many rentals you need to check
        </h1>
        <p className="text-slate-600 mt-3">
          {configured
            ? stripe?.mode === "live"
              ? "Secure checkout is provided by Stripe."
              : "Secure test checkout is provided by Stripe."
            : "Paid checkout is currently unavailable. Free scans remain available."}
        </p>
      </div>
      <p className="max-w-3xl mx-auto mt-6 text-center text-sm text-slate-600">
        Every assessment shows which checks ran and which were unavailable.
        Buying a report adds a printable document; it does not rerun the scan,
        verify ownership, or guarantee safety. Pro removes the monthly scan
        limit; request rate limits still apply.
      </p>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {plans.map(([key, plan], i) => (
          <div
            className={`card p-7 ${i === 1 ? "border-2 border-teal" : ""}`}
            key={key}
          >
            <p className="eyebrow">{plan.name}</p>
            <p className="text-3xl font-extrabold mt-3">{plan.price}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {features[key].map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            {key === "free" ? (
              <Link href="/analyze" className="btn w-full mt-8">
                Start free
              </Link>
            ) : (
              <CheckoutButton
                plan={key}
                scanId={key === "report" ? searchParams.scanId : undefined}
                disabled={
                  !configured || (key === "report" && !searchParams.scanId)
                }
              />
            )}
            {key === "report" && !searchParams.scanId && (
              <p className="text-xs text-slate-500 mt-2">
                Run a free scan or reopen one from history, then choose Get
                report on its results page.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { CheckoutButton } from "@/components/CheckoutButton";
import { getStripeConfiguration } from "@/lib/env";
import { PLANS } from "@/lib/plans";

const features = {
  free: [
    `${PLANS.free.monthlyScanLimit} basic scans per month`,
    "Listing text analysis",
    "Scam warning signs",
    "Basic Trust Score",
  ],
  report: [
    "One full property report",
    "Full risk analysis",
    "Communication analysis",
    "Printable, PDF-ready report",
  ],
  pro: [
    PLANS.pro.monthlyScanLimit === null
      ? "Unlimited scans"
      : `${PLANS.pro.monthlyScanLimit} scans per month`,
    "Saved reports",
    "Advanced verification",
    "Communication analysis",
    "Image uploads",
  ],
};

export default function Pricing({
  searchParams,
}: {
  searchParams: { scanId?: string };
}) {
  const stripe = getStripeConfiguration();
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
          Choose the level of verification you need
        </h1>
        <p className="text-slate-600 mt-3">
          {configured
            ? stripe?.mode === "live"
              ? "Secure checkout is provided by Stripe."
              : "Secure test checkout is provided by Stripe."
            : "Paid checkout is currently unavailable. Free scans remain available."}
        </p>
      </div>
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
                Run or open a scan to purchase its report.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

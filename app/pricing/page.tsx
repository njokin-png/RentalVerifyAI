import Link from "next/link";
const plans = [
  [
    "FREE",
    "$0",
    [
      "3 basic scans per month",
      "Listing text analysis",
      "Scam warning signs",
      "Basic Trust Score",
    ],
  ],
  [
    "RENTAL VERIFY REPORT",
    "$4.99",
    [
      "One full property report",
      "Full risk analysis",
      "Communication analysis",
      "Printable, PDF-ready report",
    ],
  ],
  [
    "PRO",
    "$9.99/month",
    [
      "Unlimited scans",
      "Saved reports",
      "Advanced verification",
      "Communication analysis",
      "Image uploads",
    ],
  ],
];
export default function Pricing() {
  return (
    <div className="container py-16">
      <div className="text-center">
        <p className="eyebrow">CLEAR PRICING</p>
        <h1 className="text-4xl font-extrabold mt-2">
          Choose the level of verification you need
        </h1>
        <p className="text-slate-600 mt-3">
          Payments remain in demo mode until Stripe is configured.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {plans.map(([name, price, features], i) => (
          <div
            className={`card p-7 ${i === 1 ? "border-2 border-teal" : ""}`}
            key={name as string}
          >
            <p className="eyebrow">{name as string}</p>
            <p className="text-3xl font-extrabold mt-3">{price as string}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {(features as string[]).map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <Link href="/analyze" className="btn w-full mt-8">
              {i ? "Choose plan" : "Start free"}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

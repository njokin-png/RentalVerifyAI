import { Disclaimer } from "@/components/Disclaimer";
const steps = [
  [
    "1",
    "Share the listing",
    "Enter the property, listing, contact, rent, and relevant messages.",
  ],
  [
    "2",
    "Run explainable checks",
    "Deterministic rules and swappable provider adapters review risk signals and verification gaps.",
  ],
  [
    "3",
    "Act on clear next steps",
    "Use the score breakdown and report to independently verify before paying.",
  ],
];
export default function About() {
  return (
    <div className="container max-w-4xl py-16">
      <p className="eyebrow">HOW IT WORKS</p>
      <h1 className="text-4xl font-extrabold mt-2">
        A transparent rental risk assessment
      </h1>
      <p className="text-lg text-slate-600 mt-4">
        RentalVerify AI combines multiple signals rather than treating any
        single warning sign as proof.
      </p>
      <div className="space-y-5 mt-10">
        {steps.map(([n, t, d]) => (
          <div className="card p-6 flex gap-5" key={n}>
            <span className="bg-teal text-white rounded-full w-10 h-10 grid place-items-center font-bold shrink-0">
              {n}
            </span>
            <div>
              <h2 className="font-extrabold text-xl">{t}</h2>
              <p className="text-slate-600 mt-1">{d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}

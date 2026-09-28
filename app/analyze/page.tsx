import type { Metadata } from "next";
import { AnalyzeForm } from "@/components/AnalyzeForm";
import { Disclaimer } from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "Check a rental",
  description:
    "Paste a rental listing link and check it for explainable scam warning signs and verification gaps before sending money.",
  alternates: { canonical: "/analyze" },
};

export default function Analyze() {
  return (
    <div className="container max-w-4xl py-12">
      <p className="eyebrow">RENTAL RISK CHECK</p>
      <h1 className="text-4xl font-extrabold mt-2">Check a Rental Before You Pay</h1>
      <p className="text-slate-600 mt-3 mb-7">
        Start with the listing link. We will fill in what we can, then ask only
        for the details that are still missing.
      </p>
      <AnalyzeForm />
      <div className="mt-6"><Disclaimer /></div>
    </div>
  );
}

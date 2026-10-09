import type { Metadata } from "next";
import { AnalyzeForm } from "@/components/AnalyzeForm";
import { Disclaimer } from "@/components/Disclaimer";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Check a rental",
  description:
    "Paste a rental listing link and check it for explainable scam warning signs and verification gaps before sending money.",
  alternates: { canonical: "/analyze" },
};

export default async function Analyze() {
  const session = await getSession();
  const demo = process.env.DEMO_MODE === "true";
  return (
    <div className="container max-w-4xl py-12">
      <p className="eyebrow">RENTAL RISK CHECK</p>
      <h1 className="text-4xl font-extrabold mt-2">
        Check a Rental Before You Pay
      </h1>
      <p className="text-slate-600 mt-3 mb-7">
        Start with the listing link. We will fill in what we can, then ask only
        for the details that are still missing.
      </p>
      {demo && (
        <p
          className="bg-amber-50 border border-amber-300 p-4 mb-6"
          role="status"
        >
          <b>Demo assessment:</b> Provider findings use simulated data. This is
          not independent verification of your listing.
        </p>
      )}
      {!session && !demo ? (
        <div className="card p-7">
          <h2 className="text-xl font-bold">Start with a free account</h2>
          <p className="mt-3 text-slate-600">
            Get 3 checks per calendar month, keep your results private in your
            account, and reopen a scan to purchase its printable report. No
            credit card required.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link className="btn" href="/signup?next=%2Fanalyze">
              Create free account
            </Link>
            <Link className="btn" href="/login?next=%2Fanalyze">
              Log in
            </Link>
          </div>
          <p className="mt-4">
            <Link className="text-teal underline" href="/results/demo-rent">
              View an example assessment
            </Link>
          </p>
        </div>
      ) : (
        <AnalyzeForm demo={demo} />
      )}
      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}

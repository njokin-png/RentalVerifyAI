import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Search,
  MessageSquare,
  FileCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const benefits: Array<[LucideIcon, string, string]> = [
  [
    Search,
    "Listing & property checks",
    "Review listing language, address information, duplicate evidence, and rent anomalies.",
  ],
  [
    MessageSquare,
    "Communication review",
    "See the exact language that triggered pressure, payment, or identity concerns.",
  ],
  [
    FileCheck,
    "Clear investigation report",
    "Understand verified, unverified, and unavailable checks plus practical next steps.",
  ],
];
export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-br from-mist via-white to-teal/10 py-20 md:py-28">
        <div className="container grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="eyebrow">RENT WITH MORE CONFIDENCE</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-4 leading-tight">
              Check the warning signs{" "}
              <span className="text-teal">before you pay.</span>
            </h1>
            <p className="text-lg text-slate-600 mt-6 max-w-xl">
              We help you identify rental scam warning signs before you send
              money, share personal details, or sign a lease.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn text-lg" href="/analyze">
                CHECK THIS RENTAL <ArrowRight className="ml-2" />
              </Link>
              <Link className="px-5 py-3 font-bold" href="/about">
                See how it works
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              No credit card required · Demo mode available
            </p>
          </div>
          <div className="card p-6 md:p-8">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Example Rental Trust Score
                </p>
                <p className="text-6xl font-extrabold mt-2">
                  72<span className="text-xl text-slate-400">/100</span>
                </p>
              </div>
              <ShieldCheck className="text-teal" size={48} />
            </div>
            <div className="h-3 rounded-full bg-slate-100 mt-6">
              <div className="h-full rounded-full bg-amber w-[72%]" />
            </div>
            <p className="font-bold text-amber mt-3">Some Concerns</p>
            <div className="mt-6 space-y-3 text-sm">
              {[
                "Address format validated",
                "Messages checked for payment pressure",
                "Ownership record still unverified",
              ].map((x) => (
                <p key={x} className="flex gap-2">
                  <CheckCircle2 size={18} className="text-teal" />
                  {x}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">ONE EXPLAINABLE ASSESSMENT</p>
          <h2 className="text-3xl font-extrabold mt-3">
            More context than a gut feeling
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {benefits.map(([Icon, t, d]) => (
            <div className="card p-7" key={t}>
              <Icon className="text-teal" />
              <h3 className="font-extrabold text-xl mt-5">{t}</h3>
              <p className="text-slate-600 mt-2">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Disclaimer />
        </div>
      </section>
    </>
  );
}

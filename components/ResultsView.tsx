import Link from "next/link";
import type { ScanResult } from "@/lib/types";
import { ScoreRing } from "./ScoreRing";
import { Disclaimer } from "./Disclaimer";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Printer,
  ShieldQuestion,
} from "lucide-react";
export function ResultsView({ scan }: { scan: ScanResult }) {
  const top = scan.signals
    .slice()
    .sort((a, b) => b.deduction - a.deduction)
    .slice(0, 3);
  const verified = scan.checks.filter((c) => c.status === "verified");
  const gaps = scan.checks.filter((c) => c.status !== "verified");
  return (
    <div className="space-y-7">
      <section className="card p-7 grid md:grid-cols-[auto_1fr] gap-8 items-center">
        <ScoreRing score={scan.score} />
        <div>
          <p className="eyebrow">RENTAL TRUST SCORE</p>
          <h1 className="text-3xl font-extrabold mt-2">
            {scan.classification}
          </h1>
          <p className="text-slate-600 mt-2">{scan.input.address}</p>
          <div className="flex flex-wrap gap-3 mt-5 text-sm">
            <span className="bg-slate-100 px-3 py-2 rounded-lg">
              <b>{scan.confidence}</b> confidence
            </span>
            <span className="bg-slate-100 px-3 py-2 rounded-lg">
              <b>{scan.checksCompleted}</b> checks completed
            </span>
            <span className="bg-slate-100 px-3 py-2 rounded-lg">
              <b>{scan.checksUnavailable}</b> unavailable
            </span>
            <span className="bg-slate-100 px-3 py-2 rounded-lg">
              <b>{scan.signals.length}</b> risk signals
            </span>
          </div>
        </div>
      </section>
      <Disclaimer />
      <section>
        <h2 className="text-2xl font-extrabold mb-4">Top concerns</h2>
        {top.length ? (
          <div className="grid md:grid-cols-3 gap-4">
            {top.map((s) => (
              <article
                className="card p-5 border-l-4 border-l-amber"
                key={s.code}
              >
                <AlertTriangle className="text-amber" />
                <h3 className="font-bold mt-3">{s.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{s.explanation}</p>
                {s.evidence && (
                  <p className="text-xs bg-slate-50 p-2 rounded mt-3">
                    Matched: “{s.evidence}”
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="card p-5 text-slate-600">
            No rule-based warning signs were detected. This does not confirm
            legitimacy; complete independent checks.
          </div>
        )}
      </section>
      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-extrabold text-xl flex gap-2">
            <CheckCircle2 className="text-teal" />
            Verified information
          </h2>
          <div className="mt-4 space-y-4">
            {verified.map((c) => (
              <div key={c.name}>
                <b className="text-sm">{c.name}</b>
                <p className="text-sm text-slate-600">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-extrabold text-xl flex gap-2">
            <HelpCircle className="text-amber" />
            Unverified & unavailable
          </h2>
          <div className="mt-4 space-y-4">
            {gaps.map((c) => (
              <div key={c.name}>
                <b className="text-sm">
                  {c.name} · {c.status}
                </b>
                <p className="text-sm text-slate-600">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-extrabold mb-4">
          Investigation categories
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from(new Set(scan.checks.map((c) => c.category))).map(
            (category) => (
              <div className="card p-5" key={category}>
                <ShieldQuestion className="text-teal" />
                <h3 className="font-bold capitalize mt-3">{category}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {scan.checks.filter((c) => c.category === category).length}{" "}
                  checks ·{" "}
                  {scan.signals.filter((s) => s.category === category).length}{" "}
                  signals
                </p>
              </div>
            ),
          )}
        </div>
      </section>
      <section className="card p-7">
        <h2 className="text-2xl font-extrabold">Recommended next actions</h2>
        <ol className="mt-4 grid md:grid-cols-2 gap-3">
          {scan.recommendations.map((r, i) => (
            <li className="flex gap-3 text-sm" key={r}>
              <span className="bg-teal text-white rounded-full w-6 h-6 grid place-items-center shrink-0">
                {i + 1}
              </span>
              {r}
            </li>
          ))}
        </ol>
        <div className="mt-7 flex gap-3">
          <Link className="btn" href={`/report/${scan.id}`}>
            <Printer size={18} className="mr-2" />
            View printable report
          </Link>
          <Link className="px-4 py-3 font-bold" href="/analyze">
            Check another rental
          </Link>
        </div>
      </section>
    </div>
  );
}

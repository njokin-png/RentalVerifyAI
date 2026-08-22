import Link from "next/link";
import type { ScanResult } from "@/lib/types";
import { ScoreRing } from "./ScoreRing";
import { Disclaimer } from "./Disclaimer";
import { checkStatusLabel } from "@/lib/check-status";

export function ResultsView({ scan }: { scan: ScanResult }) {
  const top = scan.signals
    .slice()
    .sort((a, b) => b.deduction - a.deduction)
    .slice(0, 3);
  const verified = scan.checks.filter((c) => c.status === "verified");
  const analyzed = scan.checks.filter((c) => c.status === "analyzed");
  const unresolved = scan.checks.filter(
    (c) => c.status === "unverified" || c.status === "mismatch",
  );
  const unavailable = scan.checks.filter((c) => c.status === "unavailable");

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
          {scan.verificationGapDeduction > 0 && (
            <p className="mt-4 text-sm text-amber-800">
              The score includes a {scan.verificationGapDeduction}-point
              deduction because some independent verification checks were
              unavailable. Missing evidence is not evidence of safety.
            </p>
          )}
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
                <h3 className="font-bold">{s.title}</h3>
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
          <h2 className="font-extrabold text-xl">Verified information</h2>
          <div className="mt-4 space-y-4">
            {verified.map((c) => (
              <div key={c.name}>
                <b className="text-sm">{c.name}</b>
                <p className="text-sm text-slate-600">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 border-2 border-amber-300 bg-amber-50/60">
          <h2 className="font-extrabold text-xl">Verification gaps</h2>
          <div className="mt-4 space-y-4">
            {[...unavailable, ...unresolved].map((c) => (
              <div key={c.name}>
                <b className="text-sm">
                  {c.name} · {checkStatusLabel(c.status)}
                </b>
                <p className="text-sm text-slate-600">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {analyzed.length > 0 && (
        <section className="card p-6">
          <h2 className="font-extrabold text-xl">Analyzed information</h2>
          <div className="mt-4 space-y-4">
            {analyzed.map((c) => (
              <div key={c.name}>
                <b className="text-sm">
                  {c.name} · {checkStatusLabel(c.status)}
                </b>
                <p className="text-sm text-slate-600">{c.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-extrabold mb-4">
          Investigation categories
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from(new Set(scan.checks.map((c) => c.category))).map(
            (category) => (
              <div className="card p-5" key={category}>
                <h3 className="font-bold capitalize">{category}</h3>
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
        <ol className="list-decimal pl-5 mt-4 grid md:grid-cols-2 gap-3 text-sm">
          {scan.recommendations.map((r) => (
            <li className="pl-1" key={r}>
              {r}
            </li>
          ))}
        </ol>
        <div className="mt-7 flex gap-3">
          <Link className="btn" href={`/report/${scan.id}`}>
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

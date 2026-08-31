import { notFound, redirect } from "next/navigation";
import { scanStore } from "@/lib/store";
import { getDemoScan } from "@/lib/demo";
import { getSession } from "@/lib/auth";
import { getOwnedScan } from "@/services/scans/repository";
import { canAccessPaidReport } from "@/services/payments/entitlements";
import { reportData } from "@/services/reports/generator";
import { Disclaimer } from "@/components/Disclaimer";
import { PrintButton } from "@/components/PrintButton";
export default async function Report({ params }: { params: { id: string } }) {
  const session = await getSession();
  let scan = scanStore.get(params.id) || getDemoScan(params.id);
  if (!scan) {
    if (!session)
      redirect(`/login?next=${encodeURIComponent(`/report/${params.id}`)}`);
    try {
      scan = (await getOwnedScan(params.id, session.userId)) ?? undefined;
    } catch {
      scan = undefined;
    }
  }
  if (!scan) notFound();
  if (
    !scanStore.has(params.id) &&
    !getDemoScan(params.id) &&
    session &&
    !(await canAccessPaidReport(session.userId, params.id))
  )
    redirect(`/pricing?scanId=${encodeURIComponent(params.id)}`);
  const r = reportData(scan);
  return (
    <div className="container max-w-4xl py-12">
      <div className="flex justify-between no-print">
        <div>
          <p className="eyebrow">INVESTIGATION REPORT</p>
          <h1 className="text-3xl font-extrabold">{r.property.address}</h1>
        </div>
        <PrintButton />
      </div>
      <p className="print-only text-sm">Generated {r.generatedAt}</p>
      <div className="card p-7 mt-7">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-slate-500">Trust Score</p>
            <b className="text-4xl">{r.assessment.score}</b>
          </div>
          <div>
            <p className="text-sm text-slate-500">Risk classification</p>
            <b>{r.assessment.classification}</b>
          </div>
          <div>
            <p className="text-sm text-slate-500">Confidence</p>
            <b>{r.assessment.confidence}</b>
          </div>
        </div>
        {r.assessment.verificationGapDeduction > 0 && (
          <p className="mt-5 border-t pt-4 text-sm text-amber-800">
            The score includes a {r.assessment.verificationGapDeduction}-point
            deduction for unavailable verification checks. Missing evidence is
            not evidence of safety.
          </p>
        )}
      </div>
      <section className="card p-7 mt-6">
        <h2 className="text-xl font-extrabold">Property & contact</h2>
        <dl className="grid md:grid-cols-2 gap-3 mt-4 text-sm">
          <div>
            <dt className="text-slate-500">Address</dt>
            <dd>{r.property.address}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Advertised rent</dt>
            <dd>${r.property.rent.toLocaleString()}/month</dd>
          </div>
          <div>
            <dt className="text-slate-500">Source</dt>
            <dd>{r.property.source}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Contact</dt>
            <dd>
              {r.contact.name} · {r.contact.company}
            </dd>
          </div>
        </dl>
      </section>
      <section className="card p-7 mt-6">
        <h2 className="text-xl font-extrabold">
          Risk signals and inconsistencies
        </h2>
        {r.signals.length ? (
          <ul className="mt-4 space-y-4">
            {r.signals.map((s) => (
              <li key={s.code}>
                <b>{s.title}</b>
                <p className="text-sm text-slate-600">{s.explanation}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-600 mt-3">
            No rule-based warning signs detected. This does not verify
            legitimacy.
          </p>
        )}
      </section>
      <section className="card p-7 mt-6 border-2 border-amber-300">
        <h2 className="text-xl font-extrabold">Verification checks</h2>
        <p className="mt-2 text-sm text-slate-600">
          OCR evidence and reverse-image matches are investigative leads only;
          neither proves that a listing is fraudulent.
        </p>
        <ul className="mt-4 space-y-3">
          {r.checks.map((c) => (
            <li
              key={c.name}
              className={`text-sm rounded-lg p-3 ${
                c.status === "unavailable"
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-slate-50"
              }`}
            >
              <b>
                {c.name} · {c.statusLabel}
              </b>
              <p className="text-slate-600">{c.detail}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="card p-7 mt-6">
        <h2 className="text-xl font-extrabold">
          Recommended verification steps
        </h2>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-sm">
          {r.recommendations.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}

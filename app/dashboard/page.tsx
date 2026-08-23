import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ScanHistoryTable } from "@/components/ScanHistoryTable";
import { listUserScans, type ScanHistoryItem } from "@/services/scans/repository";

export default async function Dashboard() {
  const session = await getSession();
  let scans: ScanHistoryItem[] = [];
  let unavailable = false;

  if (session?.userId) {
    try {
      scans = await listUserScans(session.userId, 10);
    } catch {
      unavailable = true;
    }
  }

  const average = scans.length
    ? Math.round(scans.reduce((sum, scan) => sum + scan.score, 0) / scans.length)
    : 0;
  const highRisk = scans.filter((scan) => scan.score < 50).length;

  return (
    <div className="container py-12">
      <div className="flex justify-between items-end">
        <div>
          <p className="eyebrow">DASHBOARD</p>
          <h1 className="text-3xl font-extrabold mt-2">Recent rental scans</h1>
        </div>
        <Link className="btn" href="/analyze">New scan</Link>
      </div>

      {!session ? (
        <div className="card p-6 my-8 text-sm text-slate-600">Log in to save scans and see your dashboard history.</div>
      ) : unavailable ? (
        <div className="card p-6 my-8 text-sm text-amber-800">Saved scan data is temporarily unavailable.</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 my-8">
            {[
              [String(scans.length), "Recent scans"],
              [String(average), "Average score"],
              [String(highRisk), "High-risk results"],
            ].map(([value, label]) => (
              <div className="card p-5" key={label}>
                <b className="text-3xl">{value}</b>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <ScanHistoryTable scans={scans} />
        </>
      )}
    </div>
  );
}

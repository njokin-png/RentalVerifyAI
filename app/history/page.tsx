import { getSession } from "@/lib/auth";
import { ScanHistoryTable } from "@/components/ScanHistoryTable";
import { listUserScans } from "@/services/scans/repository";

export default async function History() {
  const session = await getSession();
  let scans = [];
  let unavailable = false;

  if (session?.userId) {
    try {
      scans = await listUserScans(session.userId, 100);
    } catch {
      unavailable = true;
    }
  }

  return (
    <div className="container py-12">
      <p className="eyebrow">SCAN HISTORY</p>
      <h1 className="text-3xl font-extrabold mt-2 mb-8">Your investigations</h1>
      {!session ? (
        <div className="card p-6 text-sm text-slate-600">Log in to view saved rental scan history.</div>
      ) : unavailable ? (
        <div className="card p-6 text-sm text-amber-800">Saved scan history is temporarily unavailable.</div>
      ) : (
        <ScanHistoryTable scans={scans} />
      )}
    </div>
  );
}

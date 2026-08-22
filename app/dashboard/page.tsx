import Link from "next/link";
import { DemoTable } from "@/components/DemoTable";
export default function Dashboard() {
  return (
    <div className="container py-12">
      <div className="flex justify-between items-end">
        <div>
          <p className="eyebrow">DASHBOARD · DEMO DATA</p>
          <h1 className="text-3xl font-extrabold mt-2">Recent rental scans</h1>
        </div>
        <Link className="btn" href="/analyze">
          New scan
        </Link>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 my-8">
        {[
          ["5", "Recent scans"],
          ["55", "Average score"],
          ["2", "High-risk results"],
        ].map(([v, l]) => (
          <div className="card p-5" key={l}>
            <b className="text-3xl">{v}</b>
            <p className="text-sm text-slate-500">{l}</p>
          </div>
        ))}
      </div>
      <DemoTable />
      <p className="text-xs text-slate-500 mt-3">
        These five scenarios are seeded demonstration records. Connect
        PostgreSQL and create scans to persist user-specific history.
      </p>
    </div>
  );
}

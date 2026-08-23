import Link from "next/link";
import type { ScanHistoryItem } from "@/services/scans/repository";

export function ScanHistoryTable({ scans }: { scans: ScanHistoryItem[] }) {
  if (!scans.length) {
    return (
      <div className="card p-6 text-sm text-slate-600">
        No saved rental scans yet. Run a rental check to start your history.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="p-4">Property</th>
            <th className="p-4">Date</th>
            <th className="p-4">Score</th>
            <th className="p-4">Result</th>
            <th className="p-4">Report</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr className="border-t" key={scan.id}>
              <td className="p-4 font-semibold">{scan.address}</td>
              <td className="p-4">{new Date(scan.createdAt).toLocaleDateString()}</td>
              <td className="p-4 font-bold">{scan.score}/100</td>
              <td className="p-4">{scan.classification}</td>
              <td className="p-4">
                <Link className="font-bold text-teal-700" href={`/results/${scan.id}`}>
                  Reopen
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

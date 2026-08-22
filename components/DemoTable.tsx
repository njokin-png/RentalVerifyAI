import Link from "next/link";
import { demoScans } from "@/lib/demo";
export function DemoTable() {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-4">Address</th>
              <th className="p-4">Date</th>
              <th className="p-4">Score</th>
              <th className="p-4">Classification</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {demoScans.map((s) => (
              <tr className="border-t" key={s.id}>
                <td className="p-4 font-semibold">{s.input.address}</td>
                <td className="p-4 text-sm">Aug 22, 2026</td>
                <td className="p-4 font-extrabold">{s.score}</td>
                <td className="p-4">{s.classification}</td>
                <td className="p-4">
                  <Link
                    className="text-teal font-bold"
                    href={`/results/${s.id}`}
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

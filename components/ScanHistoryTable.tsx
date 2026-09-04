"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ScanHistoryItem } from "@/services/scans/repository";

function DeleteScanButton({ id, address }: { id: string; address: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (
      !window.confirm(
        `Permanently delete the saved investigation for ${address}?`,
      )
    )
      return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/scans/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("delete failed");
      router.refresh();
    } catch {
      setError("Could not delete");
      setDeleting(false);
    }
  }

  return (
    <div>
      <button
        className="font-bold text-red-700 disabled:opacity-50"
        disabled={deleting}
        onClick={remove}
        type="button"
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

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
            <th className="p-4">Privacy</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr className="border-t" key={scan.id}>
              <td className="p-4 font-semibold">{scan.address}</td>
              <td className="p-4">
                {new Date(scan.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 font-bold">{scan.score}/100</td>
              <td className="p-4">{scan.classification}</td>
              <td className="p-4">
                <Link
                  className="font-bold text-teal-700"
                  href={`/results/${scan.id}`}
                >
                  Reopen
                </Link>
              </td>
              <td className="p-4">
                <DeleteScanButton id={scan.id} address={scan.address} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

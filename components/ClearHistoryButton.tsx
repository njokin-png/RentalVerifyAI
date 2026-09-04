"use client";

import { useState } from "react";

export function ClearHistoryButton() {
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  async function clearHistory() {
    if (
      !window.confirm(
        "Permanently delete every saved investigation and report in your account? This cannot be undone.",
      )
    )
      return;

    setDeleting(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/scans", { method: "DELETE" });
      if (!response.ok) throw new Error("delete failed");
      const result = (await response.json()) as { deleted: number };
      setMessage(
        result.deleted === 1
          ? "1 saved investigation deleted."
          : `${result.deleted} saved investigations deleted.`,
      );
    } catch {
      setMessage(
        "Saved investigations could not be deleted. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <button
        className="rounded-lg border border-red-700 px-4 py-2 font-bold text-red-700 disabled:opacity-50"
        disabled={deleting}
        onClick={clearHistory}
        type="button"
      >
        {deleting ? "Deleting…" : "Delete all saved investigations"}
      </button>
      {message ? (
        <p className="mt-3 text-sm" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}

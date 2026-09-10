"use client";

import { useState } from "react";

export function ManageSubscriptionButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/billing-portal", { method: "POST" });
      const data = (await response.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;
      if (!response.ok || !data?.url)
        throw new Error(
          data?.error || "Could not open subscription management.",
        );
      window.location.assign(data.url);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not open subscription management.",
      );
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        className="btn btn-secondary"
        type="button"
        onClick={openPortal}
        disabled={busy}
      >
        {busy ? "OPENING…" : "MANAGE SUBSCRIPTION"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

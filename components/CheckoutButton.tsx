"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PaidPlan } from "@/lib/plans";

export function CheckoutButton({
  plan,
  scanId,
  disabled = false,
}: {
  plan: PaidPlan;
  scanId?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function checkout() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan, scanId }),
    });
    const data = await response.json();
    if (response.status === 401) {
      router.push(
        `/login?next=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    if (!response.ok || !data.url) {
      setError(data.error || "Checkout is unavailable.");
      setBusy(false);
      return;
    }
    window.location.assign(data.url);
  }
  return (
    <div>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={checkout}
        className="btn w-full mt-8"
      >
        {busy ? "OPENING CHECKOUT…" : "Choose plan"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-700 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

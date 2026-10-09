"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { safeReturnPath } from "@/lib/return-path";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Please try again.");
      const next = safeReturnPath(
        new URLSearchParams(window.location.search).get("next") || undefined,
      );
      router.push(
        mode === "signup"
          ? next === "/dashboard"
            ? "/check-email"
            : `/check-email?next=${encodeURIComponent(next)}`
          : next,
      );
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={go} className="card p-7 space-y-5">
      {mode === "signup" && (
        <label>
          <span className="label">Name</span>
          <input required name="name" className="input" autoComplete="name" />
        </label>
      )}
      <label>
        <span className="label">Email</span>
        <input
          required
          name="email"
          type="email"
          className="input"
          autoComplete="email"
        />
      </label>
      <label>
        <span className="label">Password</span>
        <input
          required
          name="password"
          type="password"
          minLength={10}
          className="input"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        <span className="text-xs text-slate-500">At least 10 characters</span>
      </label>
      {error && <p className="text-red-700 text-sm">{error}</p>}
      <button className="btn w-full" disabled={busy}>
        {busy
          ? "PLEASE WAIT…"
          : mode === "login"
            ? "Log in"
            : "Create secure account"}
      </button>
    </form>
  );
}

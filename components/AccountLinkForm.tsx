"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AccountLinkForm({
  mode,
}: {
  mode: "forgot-password" | "resend-verification" | "reset-password";
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    const form = Object.fromEntries(new FormData(e.currentTarget));
    const payload =
      mode === "reset-password"
        ? { ...form, token: searchParams.get("token") || "" }
        : form;
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "This request could not be completed.");
      return;
    }
    if (mode === "reset-password") {
      router.push("/login?reset=success");
      return;
    }
    setMessage(data.message || "Check your email for the next step.");
  }

  return (
    <form onSubmit={submit} className="card p-7 space-y-5">
      {mode !== "reset-password" ? (
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
      ) : (
        <label>
          <span className="label">New password</span>
          <input
            required
            name="password"
            type="password"
            minLength={10}
            maxLength={128}
            className="input"
            autoComplete="new-password"
          />
          <span className="text-xs text-slate-500">At least 10 characters</span>
        </label>
      )}
      {error && <p className="text-red-700 text-sm">{error}</p>}
      {message && <p className="text-teal-800 text-sm">{message}</p>}
      <button className="btn w-full">
        {mode === "forgot-password"
          ? "Send reset link"
          : mode === "resend-verification"
            ? "Resend verification"
            : "Set new password"}
      </button>
    </form>
  );
}

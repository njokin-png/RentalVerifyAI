"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CheckoutConfirmation({ sessionId }: { sessionId?: string }) {
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState(
    "Confirming your payment and access. Please wait.",
  );
  const [retry, setRetry] = useState(0);
  const [waiting, setWaiting] = useState(true);
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    let attempts = 0;
    async function check() {
      if (!sessionId) {
        setMessage(
          "No checkout reference was provided. Check your account or contact support if you paid.",
        );
        setWaiting(false);
        return;
      }
      try {
        const response = await fetch(
          `/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const data = await response.json();
        if (stopped) return;
        if (response.status === 401) {
          setDestination(
            `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
          );
          setMessage(
            "Sign in to the account used for checkout to confirm your purchase.",
          );
          setWaiting(false);
          return;
        }
        if (response.ok && data.state === "ready") {
          setDestination(data.destination);
          setMessage("Payment confirmed. Your purchased access is ready.");
          setWaiting(false);
          return;
        }
        if (response.ok && data.state === "expired") {
          setMessage(
            "This checkout session expired. Check your account before starting another checkout.",
          );
          setWaiting(false);
          return;
        }
        setMessage(
          data.error ||
            (data.paid
              ? "Payment confirmed; your access is still being activated. Do not pay again."
              : "Payment confirmation is still pending. Do not pay again while we check."),
        );
      } catch {
        if (stopped) return;
        setMessage(
          "Could not connect to payment confirmation. Retry or check your account; do not pay again.",
        );
      }
      if (++attempts < 10) timer = setTimeout(check, 3000);
      else setWaiting(false);
    }
    void check();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [sessionId, retry]);
  return (
    <div>
      <p role="status" className="text-slate-600 mt-4">
        {message}
      </p>
      {destination ? (
        <Link className="btn mt-8" href={destination}>
          {destination.startsWith("/report/")
            ? "Open your report"
            : destination.startsWith("/login")
              ? "Sign in to confirm"
              : "View your account"}
        </Link>
      ) : (
        <button
          className="btn mt-8"
          disabled={waiting}
          onClick={() => {
            setWaiting(true);
            setDestination("");
            setRetry((value) => value + 1);
          }}
        >
          {waiting ? "CONFIRMING…" : "Check again"}
        </button>
      )}
      <p className="mt-5">
        <Link className="text-teal underline" href="/dashboard">
          View saved scans
        </Link>
      </p>
    </div>
  );
}

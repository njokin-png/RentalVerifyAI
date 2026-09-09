"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="m-0 bg-slate-50 text-navy">
        <main className="mx-auto max-w-2xl px-5 py-20 text-center">
          <p className="text-xs font-extrabold tracking-widest text-teal">
            RENTALVERIFY AI
          </p>
          <h1 className="mt-2 text-4xl font-extrabold">
            We hit a temporary problem
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            No technical details or submitted rental information are shown on
            this screen. Try again, or return to RentalVerify AI.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              className="rounded-xl bg-teal px-5 py-3 font-extrabold text-white"
              type="button"
              onClick={reset}
            >
              Try again
            </button>
            <Link
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-navy"
              href="/"
            >
              Return home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}

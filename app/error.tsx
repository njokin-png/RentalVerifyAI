"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container max-w-2xl py-20 text-center">
      <p className="eyebrow">TEMPORARY PROBLEM</p>
      <h1 className="text-4xl font-extrabold mt-2">
        This page couldn&apos;t be loaded
      </h1>
      <p className="text-slate-600 mt-4 leading-7">
        Your information has not been displayed. Try the page again, or return
        home and continue when you&apos;re ready.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
        <button className="btn" type="button" onClick={reset}>
          Try again
        </button>
        <Link
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-navy hover:border-teal"
          href="/"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

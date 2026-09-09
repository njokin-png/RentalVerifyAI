import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container max-w-2xl py-20 text-center">
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1 className="text-4xl font-extrabold mt-2">
        We couldn&apos;t find that page
      </h1>
      <p className="text-slate-600 mt-4 leading-7">
        The link may be outdated or the address may have been entered
        incorrectly. You can start a new rental check or return to the home
        page.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
        <Link className="btn" href="/analyze">
          Check a rental
        </Link>
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

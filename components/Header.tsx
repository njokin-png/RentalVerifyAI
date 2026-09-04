import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";

function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <form action="/api/auth/logout" method="post">
      <button
        className={`font-semibold hover:text-teal ${className}`}
        type="submit"
      >
        Log out
      </button>
    </form>
  );
}

export async function Header() {
  const session = await getSession();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="container h-18 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-xl"
        >
          <span className="bg-teal text-white p-2 rounded-xl">
            <ShieldCheck size={22} />
          </span>
          RentalVerify <span className="text-teal">AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link href="/analyze">Analyze</Link>
          <Link href="/safety">Safety tips</Link>
          <Link href="/about">How it works</Link>
          <Link href="/pricing">Pricing</Link>
          {session ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login">Log in</Link>
          )}
          <Link className="btn !py-2" href="/analyze">
            CHECK THIS RENTAL
          </Link>
        </nav>
        <details className="relative md:hidden text-sm">
          <summary className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 font-bold text-navy hover:border-teal hover:text-teal">
            Menu
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 z-50 mt-2 min-w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
          >
            <Link
              className="block rounded-lg px-3 py-2 hover:bg-mist"
              href="/analyze"
            >
              Analyze
            </Link>
            <Link
              className="block rounded-lg px-3 py-2 hover:bg-mist"
              href="/safety"
            >
              Safety tips
            </Link>
            <Link
              className="block rounded-lg px-3 py-2 hover:bg-mist"
              href="/about"
            >
              How it works
            </Link>
            <Link
              className="block rounded-lg px-3 py-2 hover:bg-mist"
              href="/pricing"
            >
              Pricing
            </Link>
            {session ? (
              <>
                <Link
                  className="block rounded-lg px-3 py-2 hover:bg-mist"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  className="block rounded-lg px-3 py-2 hover:bg-mist"
                  href="/history"
                >
                  History
                </Link>
                <Link
                  className="block rounded-lg px-3 py-2 hover:bg-mist"
                  href="/account"
                >
                  Account
                </Link>
                <LogoutButton className="block w-full rounded-lg px-3 py-2 text-left hover:bg-mist" />
              </>
            ) : (
              <Link
                className="block rounded-lg px-3 py-2 hover:bg-mist"
                href="/login"
              >
                Log in
              </Link>
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <button className="font-semibold hover:text-teal" type="submit">
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
        <div className="md:hidden flex items-center gap-3 text-sm">
          {session ? (
            <>
              <Link className="font-semibold" href="/dashboard">
                Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link className="font-semibold" href="/login">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

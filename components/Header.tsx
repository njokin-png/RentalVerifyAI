import Link from "next/link";
import { ShieldCheck } from "lucide-react";
export function Header() {
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
          <Link href="/login">Log in</Link>
          <Link className="btn !py-2" href="/analyze">
            CHECK THIS RENTAL
          </Link>
        </nav>
        <Link href="/analyze" className="md:hidden btn !py-2">
          Check rental
        </Link>
      </div>
    </header>
  );
}

import Link from "next/link";
export function Footer() {
  return (
    <footer className="border-t bg-white mt-20">
      <div className="container py-10 grid md:grid-cols-2 gap-5 text-sm text-slate-600">
        <div>
          <b className="text-navy">RentalVerify AI</b>
          <p className="mt-2">
            We help you identify rental scam warning signs before you send
            money.
          </p>
        </div>
        <div className="md:text-right space-x-4">
          <Link href="/about">How it works</Link>
          <Link href="/safety">Safety</Link>
          <Link href="/pricing">Pricing</Link>
          <p className="mt-3">© 2026 RentalVerify AI</p>
        </div>
      </div>
    </footer>
  );
}

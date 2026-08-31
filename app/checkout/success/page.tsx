import Link from "next/link";
export default function CheckoutSuccess() {
  return (
    <div className="container max-w-xl py-20 text-center">
      <p className="eyebrow">PAYMENT RECEIVED</p>
      <h1 className="text-4xl font-extrabold mt-2">Checkout complete</h1>
      <p className="text-slate-600 mt-4">
        Stripe is confirming your purchase. Your access is granted only after
        the signed webhook is processed.
      </p>
      <Link className="btn mt-8" href="/dashboard">
        Continue to dashboard
      </Link>
    </div>
  );
}

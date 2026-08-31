import Link from "next/link";
export default function CheckoutCancel() {
  return (
    <div className="container max-w-xl py-20 text-center">
      <p className="eyebrow">CHECKOUT CANCELED</p>
      <h1 className="text-4xl font-extrabold mt-2">No payment was made</h1>
      <p className="text-slate-600 mt-4">
        Your free access is unchanged. You can return to pricing whenever you
        are ready.
      </p>
      <Link className="btn mt-8" href="/pricing">
        Return to pricing
      </Link>
    </div>
  );
}

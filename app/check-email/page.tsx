import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-3xl font-extrabold">Check your email</h1>
      <p className="text-slate-600 mt-3">
        Your account was created. If email delivery is configured, we sent a verification link. You can continue using the app while verification is pending.
      </p>
      <div className="mt-6 space-y-3">
        <Link className="btn block text-center" href="/dashboard">
          Continue to dashboard
        </Link>
        <Link className="text-teal font-bold block text-center" href="/resend-verification">
          Resend verification email
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { AccountLinkForm } from "@/components/AccountLinkForm";

export default function ResendVerificationPage() {
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-3xl font-extrabold">Resend verification</h1>
      <p className="text-slate-600 mt-2 mb-6">
        Enter the email address for your account. For privacy, the response will not confirm whether an account exists.
      </p>
      <AccountLinkForm mode="resend-verification" />
      <Link className="text-teal font-bold block text-center mt-5" href="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}

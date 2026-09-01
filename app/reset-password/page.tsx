import Link from "next/link";
import { AccountLinkForm } from "@/components/AccountLinkForm";

export default function ResetPasswordPage() {
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-3xl font-extrabold">Choose a new password</h1>
      <p className="text-slate-600 mt-2 mb-6">
        Use the one-time reset link from your email. Reset links expire after one hour.
      </p>
      <AccountLinkForm mode="reset-password" />
      <Link className="text-teal font-bold block text-center mt-5" href="/login">
        Back to login
      </Link>
    </div>
  );
}

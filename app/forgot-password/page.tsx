import Link from "next/link";
import { AccountLinkForm } from "@/components/AccountLinkForm";

export default function ForgotPasswordPage() {
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-3xl font-extrabold">Reset your password</h1>
      <p className="text-slate-600 mt-2 mb-6">
        Enter your email. The response is the same whether or not an account exists.
      </p>
      <AccountLinkForm mode="forgot-password" />
      <Link className="text-teal font-bold block text-center mt-5" href="/login">
        Back to login
      </Link>
    </div>
  );
}

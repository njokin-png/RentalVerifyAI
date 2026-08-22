import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
export default function Signup() {
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="text-slate-600 mt-2 mb-6">
        Save investigations and revisit reports.
      </p>
      <AuthForm mode="signup" />
      <p className="text-center mt-5 text-sm">
        Already registered?{" "}
        <Link className="text-teal font-bold" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}

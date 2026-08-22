import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
export default function Login() {
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="text-slate-600 mt-2 mb-6">
        Open saved rental investigations.
      </p>
      <AuthForm mode="login" />
      <p className="text-center mt-5 text-sm">
        New here?{" "}
        <Link className="text-teal font-bold" href="/signup">
          Create an account
        </Link>
      </p>
    </div>
  );
}

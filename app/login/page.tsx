import Link from "next/link";
import { safeReturnPath } from "@/lib/return-path";
import { AuthForm } from "@/components/AuthForm";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeReturnPath((await searchParams).next);
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="text-slate-600 mt-2 mb-6">
        Open saved rental investigations.
      </p>
      <AuthForm mode="login" />
      <p className="text-center mt-4 text-sm">
        <Link className="text-teal font-bold" href="/forgot-password">
          Forgot password?
        </Link>
      </p>
      <p className="text-center mt-5 text-sm">
        New here?{" "}
        <Link
          className="text-teal font-bold"
          href={`/signup?next=${encodeURIComponent(next)}`}
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

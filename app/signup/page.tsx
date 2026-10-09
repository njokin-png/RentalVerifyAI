import Link from "next/link";
import { safeReturnPath } from "@/lib/return-path";
import { AuthForm } from "@/components/AuthForm";
export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeReturnPath((await searchParams).next);
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="text-slate-600 mt-2 mb-6">
        Save investigations and revisit reports.
      </p>
      <AuthForm mode="signup" />
      <p className="text-center mt-5 text-sm">
        Already registered?{" "}
        <Link
          className="text-teal font-bold"
          href={`/login?next=${encodeURIComponent(next)}`}
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

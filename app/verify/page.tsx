import Link from "next/link";

export default async function VerifyPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const success = searchParams.status === "success";
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-3xl font-extrabold">
        {success ? "Email verified" : "Verification link unavailable"}
      </h1>
      <p className="text-slate-600 mt-3">
        {success
          ? "Your email address is now verified."
          : "This verification link is invalid, expired, already used, or temporarily unavailable."}
      </p>
      <div className="mt-6 space-y-3">
        <Link className="btn block text-center" href="/dashboard">
          Continue to dashboard
        </Link>
        {!success && (
          <Link
            className="text-teal font-bold block text-center"
            href="/resend-verification"
          >
            Request another verification link
          </Link>
        )}
      </div>
    </div>
  );
}

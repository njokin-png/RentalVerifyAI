import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PLANS } from "@/lib/plans";

export default async function Account() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Faccount");

  return (
    <div className="container max-w-2xl py-12">
      <p className="eyebrow">ACCOUNT</p>
      <h1 className="text-3xl font-extrabold mt-2">Settings</h1>
      <div className="card p-6 mt-7 space-y-5">
        <label>
          <span className="label">Email address</span>
          <input className="input" value={session.email} readOnly />
        </label>
        <div>
          <span className="label">Plan</span>
          <p>Free · {PLANS.free.monthlyScanLimit} basic scans per month</p>
        </div>
        <div>
          <span className="label">Conversation retention</span>
          <p className="text-sm text-slate-600">
            Conversation text is transient unless a report is explicitly saved.
            Saved data controls will be available with persistent accounts.
          </p>
        </div>
        <button className="btn">Save preferences</button>
      </div>
    </div>
  );
}

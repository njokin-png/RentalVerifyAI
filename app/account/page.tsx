import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { ClearHistoryButton } from "@/components/ClearHistoryButton";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";

export default async function Account() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Faccount");
  const account = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      stripeCustomerId: true,
      subscriptions: {
        where: {
          plan: "pro",
          status: { in: ["active", "trialing"] },
          OR: [
            { currentPeriodEnd: null },
            { currentPeriodEnd: { gt: new Date() } },
          ],
        },
        select: { id: true },
        take: 1,
      },
    },
  });
  const hasPro = Boolean(account?.subscriptions.length);

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
          <p>
            {hasPro
              ? "Pro · Unlimited scans"
              : `Free · ${PLANS.free.monthlyScanLimit} basic scans per month`}
          </p>
          {account?.stripeCustomerId ? (
            <div className="mt-3">
              <ManageSubscriptionButton />
            </div>
          ) : null}
        </div>
        <div>
          <span className="label">Conversation retention</span>
          <p className="text-sm text-slate-600">
            Conversation text is transient unless a report is explicitly saved.
            You can permanently remove individual investigations from history or
            erase all saved investigations below.
          </p>
        </div>
        <div className="border-t pt-5">
          <span className="label">Delete saved investigations</span>
          <p className="mb-3 text-sm text-slate-600">
            This permanently deletes your saved scans, reports, and related
            investigation data. Your account and subscription are not deleted.
          </p>
          <ClearHistoryButton />
        </div>
      </div>
    </div>
  );
}

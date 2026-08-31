import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";

export async function hasActivePro(userId: string, now = new Date()) {
  return Boolean(
    await prisma.subscription.findFirst({
      where: {
        userId,
        plan: "pro",
        status: { in: ["active", "trialing"] },
        OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
      },
    }),
  );
}

export async function canCreateScan(
  userId: string | undefined,
  now = new Date(),
) {
  if (!userId) return { allowed: true, remaining: null };
  if (await hasActivePro(userId, now))
    return { allowed: true, remaining: null };
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const used = await prisma.rentalScan.count({
    where: { userId, createdAt: { gte: monthStart, lt: now } },
  });
  return {
    allowed: used < PLANS.free.monthlyScanLimit,
    remaining: Math.max(0, PLANS.free.monthlyScanLimit - used),
  };
}

export async function canAccessPaidReport(userId: string, scanId: string) {
  if (await hasActivePro(userId)) return true;
  return Boolean(
    await prisma.payment.findFirst({
      where: { userId, reportScanId: scanId, status: "paid" },
    }),
  );
}

import { CheckStatus, Prisma, RiskLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Check, ScanResult } from "@/lib/types";

const riskLevelByClassification: Record<string, RiskLevel> = {
  "Low Risk": RiskLevel.LOW,
  "Some Concerns": RiskLevel.SOME_CONCERNS,
  "Moderate Risk": RiskLevel.MODERATE,
  "High Risk": RiskLevel.HIGH,
  "Very High Risk": RiskLevel.VERY_HIGH,
  "Unable to Verify": RiskLevel.UNABLE_TO_VERIFY,
};

const classificationByRiskLevel: Record<RiskLevel, string> = {
  LOW: "Low Risk",
  SOME_CONCERNS: "Some Concerns",
  MODERATE: "Moderate Risk",
  HIGH: "High Risk",
  VERY_HIGH: "Very High Risk",
  UNABLE_TO_VERIFY: "Unable to Verify",
};

const checkStatusToDb: Record<Check["status"], CheckStatus> = {
  verified: CheckStatus.VERIFIED,
  analyzed: CheckStatus.ANALYZED,
  unverified: CheckStatus.UNVERIFIED,
  unavailable: CheckStatus.UNAVAILABLE,
  mismatch: CheckStatus.MISMATCH,
};

const checkStatusFromDb: Record<CheckStatus, Check["status"]> = {
  VERIFIED: "verified",
  ANALYZED: "analyzed",
  UNVERIFIED: "unverified",
  UNAVAILABLE: "unavailable",
  MISMATCH: "mismatch",
};

const scanInclude = {
  property: true,
  listing: true,
  contact: true,
  signals: true,
  checks: true,
  conversation: true,
  report: true,
} satisfies Prisma.RentalScanInclude;

type PersistedScan = Prisma.RentalScanGetPayload<{
  include: typeof scanInclude;
}>;

function reconstruct(scan: PersistedScan): ScanResult {
  const advertisedRent = Number(scan.property?.advertisedRent ?? 0);
  const estimatedRent = scan.property?.estimatedRent
    ? Number(scan.property.estimatedRent)
    : undefined;
  const rentDifferencePercent =
    estimatedRent && estimatedRent > 0
      ? Math.round(((advertisedRent - estimatedRent) / estimatedRent) * 100)
      : undefined;

  return {
    id: scan.id,
    input: {
      address: scan.property?.address ?? "",
      zip: scan.property?.zip ?? undefined,
      bedrooms: scan.property?.bedrooms ?? undefined,
      bathrooms: scan.property?.bathrooms ?? undefined,
      advertisedRent,
      listingUrl: scan.listing?.url ?? undefined,
      listingText: scan.listing?.text ?? undefined,
      landlordName: scan.contact?.name ?? undefined,
      phone: scan.contact?.phone ?? undefined,
      email: scan.contact?.email ?? undefined,
      company: scan.contact?.company ?? undefined,
      conversation: scan.conversation?.redactedText ?? undefined,
      saveReport: Boolean(scan.report),
    },
    score: scan.score,
    classification: classificationByRiskLevel[scan.riskLevel],
    confidence: scan.confidence as ScanResult["confidence"],
    checksCompleted: scan.checksCompleted,
    checksUnavailable: scan.checksUnavailable,
    verificationGapDeduction: scan.verificationGapDeduction,
    signals: scan.signals.map((signal) => ({
      code: signal.code,
      title: signal.title,
      explanation: signal.explanation,
      severity: signal.severity as ScanResult["signals"][number]["severity"],
      category: signal.category,
      evidence: signal.evidence ?? undefined,
      deduction: signal.deduction,
    })),
    checks: scan.checks.map((check) => ({
      name: check.name,
      status: checkStatusFromDb[check.status],
      detail: check.detail,
      category: check.category,
    })),
    recommendations: scan.recommendations,
    estimatedRent,
    rentDifferencePercent,
    createdAt: scan.createdAt.toISOString(),
    reverseImageAvailable: !scan.checks.some(
      (check) =>
        check.category === "image" && check.status === CheckStatus.UNAVAILABLE,
    ),
  };
}

export async function saveScan(result: ScanResult, userId?: string | null) {
  const retainConversation = Boolean(
    result.input.saveReport && result.input.conversation,
  );
  const riskLevel =
    riskLevelByClassification[result.classification] ??
    RiskLevel.UNABLE_TO_VERIFY;

  await prisma.rentalScan.create({
    data: {
      id: result.id,
      userId: userId ?? null,
      score: result.score,
      riskLevel,
      confidence: result.confidence,
      checksCompleted: result.checksCompleted,
      checksUnavailable: result.checksUnavailable,
      verificationGapDeduction: result.verificationGapDeduction,
      recommendations: result.recommendations,
      createdAt: new Date(result.createdAt),
      property: {
        create: {
          address: result.input.address,
          zip: result.input.zip,
          bedrooms: result.input.bedrooms,
          bathrooms: result.input.bathrooms,
          advertisedRent: result.input.advertisedRent,
          estimatedRent: result.estimatedRent,
        },
      },
      listing: {
        create: {
          url: result.input.listingUrl,
          text: result.input.listingText,
        },
      },
      contact: {
        create: {
          name: result.input.landlordName,
          phone: result.input.phone,
          email: result.input.email,
          company: result.input.company,
        },
      },
      signals: {
        create: result.signals.map((signal) => ({
          code: signal.code,
          title: signal.title,
          explanation: signal.explanation,
          severity: signal.severity,
          category: signal.category,
          evidence: signal.evidence,
          deduction: signal.deduction,
        })),
      },
      checks: {
        create: result.checks.map((check) => ({
          name: check.name,
          status: checkStatusToDb[check.status],
          detail: check.detail,
          category: check.category,
        })),
      },
      conversation: retainConversation
        ? { create: { redactedText: result.input.conversation } }
        : undefined,
      report: result.input.saveReport
        ? { create: { content: result as unknown as Prisma.InputJsonValue } }
        : undefined,
    },
  });
}

export async function getScan(id: string, userId?: string | null) {
  const scan = await prisma.rentalScan.findFirst({
    where: {
      id,
      OR: [{ userId: null }, ...(userId ? [{ userId }] : [])],
    },
    include: scanInclude,
  });
  return scan ? reconstruct(scan) : null;
}

export async function getOwnedScan(id: string, userId: string) {
  const scan = await prisma.rentalScan.findFirst({
    where: { id, userId },
    include: scanInclude,
  });
  return scan ? reconstruct(scan) : null;
}

export type ScanHistoryItem = {
  id: string;
  address: string;
  score: number;
  classification: string;
  createdAt: string;
};

export async function listUserScans(
  userId: string,
  limit = 25,
): Promise<ScanHistoryItem[]> {
  const rows = await prisma.rentalScan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 100)),
    include: { property: true },
  });

  return rows.map((row) => ({
    id: row.id,
    address: row.property?.address ?? "Unknown address",
    score: row.score,
    classification: classificationByRiskLevel[row.riskLevel],
    createdAt: row.createdAt.toISOString(),
  }));
}

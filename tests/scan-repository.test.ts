import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ScanResult } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rentalScan: {
      create: mocks.create,
      findFirst: mocks.findFirst,
      findMany: mocks.findMany,
    },
  },
}));

import { getScan, listUserScans, saveScan } from "@/services/scans/repository";

const result: ScanResult = {
  id: "scan-1",
  input: {
    address: "123 Main St, San Diego, CA",
    advertisedRent: 1800,
    listingText: "Example listing",
    conversation: "Send the deposit today",
  },
  score: 40,
  classification: "High Risk",
  confidence: "Low",
  checksCompleted: 4,
  checksUnavailable: 4,
  verificationGapDeduction: 16,
  signals: [
    {
      code: "PAYMENT_PRESSURE",
      title: "Immediate payment pressure",
      explanation: "Payment is requested immediately.",
      severity: "high",
      category: "communication",
      deduction: 20,
    },
  ],
  checks: [
    {
      name: "Ownership records",
      status: "unavailable",
      detail: "Provider unavailable",
      category: "property",
    },
  ],
  recommendations: ["Verify ownership independently."],
  estimatedRent: 1900,
  rentDifferencePercent: -5,
  createdAt: "2026-08-23T00:00:00.000Z",
  reverseImageAvailable: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("scan repository", () => {
  it("associates a persisted scan with the authenticated user", async () => {
    mocks.create.mockResolvedValue({});
    await saveScan(result, "user-1");
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: "scan-1",
          userId: "user-1",
          checksUnavailable: 4,
          verificationGapDeduction: 16,
        }),
      }),
    );
  });

  it("propagates persistence failures without retrying or falling back", async () => {
    const failure = new Error("database unavailable");
    mocks.create.mockRejectedValue(failure);

    await expect(saveScan(result, "user-1")).rejects.toBe(failure);
    expect(mocks.create).toHaveBeenCalledTimes(1);
  });

  it("does not retain conversation text unless saveReport is enabled", async () => {
    mocks.create.mockResolvedValue({});
    await saveScan(result, null);
    const call = mocks.create.mock.calls[0][0];
    expect(call.data.conversation).toBeUndefined();
    expect(call.data.report).toBeUndefined();
  });

  it("retains conversation and report only after explicit opt in", async () => {
    mocks.create.mockResolvedValue({});
    await saveScan({ ...result, input: { ...result.input, saveReport: true } }, "user-1");
    const call = mocks.create.mock.calls[0][0];
    expect(call.data.conversation.create.redactedText).toBe(result.input.conversation);
    expect(call.data.report.create.content).toBeTruthy();
  });

  it("limits persisted lookup to anonymous or current-user scans", async () => {
    mocks.findFirst.mockResolvedValue(null);
    await getScan("scan-1", "user-1");
    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "scan-1",
          OR: [{ userId: null }, { userId: "user-1" }],
        },
      }),
    );
  });

  it("returns newest-first user history with a bounded limit", async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: "scan-2",
        score: 40,
        riskLevel: "HIGH",
        createdAt: new Date("2026-08-23T02:00:00.000Z"),
        property: { address: "456 Oak St" },
      },
    ]);
    const history = await listUserScans("user-1", 500);
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    );
    expect(history[0]).toMatchObject({ id: "scan-2", address: "456 Oak St", classification: "High Risk" });
  });
});

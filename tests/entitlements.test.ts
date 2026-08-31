import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  subscription: vi.fn(),
  count: vi.fn(),
  payment: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: { findFirst: mocks.subscription },
    rentalScan: { count: mocks.count },
    payment: { findFirst: mocks.payment },
  },
}));
import {
  canAccessPaidReport,
  canCreateScan,
} from "@/services/payments/entitlements";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.subscription.mockResolvedValue(null);
  mocks.count.mockResolvedValue(0);
  mocks.payment.mockResolvedValue(null);
});
describe("plan enforcement", () => {
  it("preserves the free limit of three monthly scans", async () => {
    mocks.count.mockResolvedValue(3);
    await expect(
      canCreateScan("user-1", new Date("2026-08-31T12:00:00Z")),
    ).resolves.toEqual({ allowed: false, remaining: 0 });
  });
  it("gives active Pro users unlimited scans and report access", async () => {
    mocks.subscription.mockResolvedValue({ id: "sub-1" });
    await expect(canCreateScan("user-1")).resolves.toEqual({
      allowed: true,
      remaining: null,
    });
    await expect(canAccessPaidReport("user-1", "scan-1")).resolves.toBe(true);
  });
  it("grants only a paid purchased report", async () => {
    mocks.payment.mockResolvedValue({ id: "pay-1" });
    await expect(canAccessPaidReport("user-1", "scan-1")).resolves.toBe(true);
    expect(mocks.payment).toHaveBeenCalledWith({
      where: { userId: "user-1", reportScanId: "scan-1", status: "paid" },
    });
  });
});

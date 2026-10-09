import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({
  account: vi.fn(),
  retrieve: vi.fn(),
  report: vi.fn(),
  pro: vi.fn(),
  owned: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ getSession: mocks.account }));
vi.mock("@/services/payments/provider", () => ({
  stripeClient: () => ({
    checkout: { sessions: { retrieve: mocks.retrieve } },
  }),
}));
vi.mock("@/services/payments/entitlements", () => ({
  canAccessPaidReport: mocks.report,
  hasActivePro: mocks.pro,
}));
vi.mock("@/services/scans/repository", () => ({ getOwnedScan: mocks.owned }));
import { GET } from "@/app/api/checkout/status/route";
const request = () =>
  new NextRequest(
    "http://localhost/api/checkout/status?session_id=cs_test_123",
  );
beforeEach(() => {
  vi.clearAllMocks();
  mocks.account.mockResolvedValue({ userId: "user-1" });
  mocks.retrieve.mockResolvedValue({
    status: "complete",
    payment_status: "paid",
    metadata: { userId: "user-1", plan: "report", scanId: "scan-1" },
  });
  mocks.report.mockResolvedValue(false);
  mocks.pro.mockResolvedValue(false);
  mocks.owned.mockResolvedValue({ id: "scan-1" });
});
describe("checkout confirmation", () => {
  it("requires sign-in before retrieving payment details", async () => {
    mocks.account.mockResolvedValue(null);
    expect((await GET(request())).status).toBe(401);
    expect(mocks.retrieve).not.toHaveBeenCalled();
  });
  it("does not disclose another customer's checkout", async () => {
    mocks.account.mockResolvedValue({ userId: "other" });
    expect((await GET(request())).status).toBe(404);
    expect(mocks.report).not.toHaveBeenCalled();
  });
  it("waits for signed webhook entitlement even when Stripe says paid", async () => {
    const response = await GET(request());
    expect(await response.json()).toEqual({
      state: "pending",
      paid: true,
      plan: "report",
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("opens only the owned, paid report", async () => {
    mocks.report.mockResolvedValue(true);
    expect(await (await GET(request())).json()).toEqual({
      state: "ready",
      paid: true,
      plan: "report",
      destination: "/report/scan-1",
    });
    mocks.owned.mockResolvedValue(null);
    expect((await (await GET(request())).json()).state).toBe("pending");
  });
  it("never unlocks access for an unpaid checkout", async () => {
    mocks.retrieve.mockResolvedValue({
      status: "open",
      payment_status: "unpaid",
      metadata: { userId: "user-1", plan: "report", scanId: "scan-1" },
    });
    mocks.report.mockResolvedValue(true);
    expect((await (await GET(request())).json()).state).toBe("pending");
    expect(mocks.report).not.toHaveBeenCalled();
  });
  it("waits for active Pro and then links to subscription management", async () => {
    mocks.retrieve.mockResolvedValue({
      status: "complete",
      payment_status: "paid",
      metadata: { userId: "user-1", plan: "pro" },
    });
    expect((await (await GET(request())).json()).state).toBe("pending");
    mocks.pro.mockResolvedValue(true);
    expect((await (await GET(request())).json()).destination).toBe("/account");
  });
  it("offers safe recovery if Stripe is unavailable", async () => {
    mocks.retrieve.mockRejectedValue(new Error("private secret"));
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private secret");
  });
});

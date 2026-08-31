import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  config: vi.fn(),
  findUser: vi.fn(),
  findScan: vi.fn(),
  checkout: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/env", () => ({ getStripeConfiguration: mocks.config }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.findUser },
    rentalScan: { findFirst: mocks.findScan },
  },
}));
vi.mock("@/services/payments/provider", () => ({
  createCheckout: mocks.checkout,
}));
import { POST } from "@/app/api/checkout/route";

const request = (body: object) =>
  new NextRequest("http://localhost/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.config.mockReturnValue({});
  mocks.getSession.mockResolvedValue({
    userId: "user-1",
    email: "u@example.com",
  });
  mocks.findUser.mockResolvedValue({ stripeCustomerId: null });
  mocks.findScan.mockResolvedValue({ id: "scan-1" });
  mocks.checkout.mockResolvedValue({
    url: "https://checkout.stripe.test/session",
  });
});

describe("checkout access", () => {
  it("rejects unauthenticated checkout", async () => {
    mocks.getSession.mockResolvedValue(null);
    expect((await POST(request({ plan: "pro" }))).status).toBe(401);
    expect(mocks.checkout).not.toHaveBeenCalled();
  });
  it("creates authenticated checkout server-side", async () => {
    const response = await POST(request({ plan: "report", scanId: "scan-1" }));
    expect(response.status).toBe(200);
    expect(mocks.checkout).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        plan: "report",
        scanId: "scan-1",
      }),
    );
  });
  it("safely disables checkout when Stripe is missing", async () => {
    mocks.config.mockReturnValue(null);
    expect((await POST(request({ plan: "pro" }))).status).toBe(503);
    expect(mocks.checkout).not.toHaveBeenCalled();
  });
});

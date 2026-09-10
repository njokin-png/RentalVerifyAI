import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  config: vi.fn(),
  findUser: vi.fn(),
  createPortal: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/env", () => ({ getStripeConfiguration: mocks.config }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUser } },
}));
vi.mock("@/services/payments/provider", () => ({
  createCustomerPortal: mocks.createPortal,
}));

import { POST } from "@/app/api/billing-portal/route";

const request = () =>
  new NextRequest("https://app.example.com/api/billing-portal", {
    method: "POST",
  });

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.NEXT_PUBLIC_APP_URL;
  mocks.config.mockReturnValue({});
  mocks.getSession.mockResolvedValue({
    userId: "user-1",
    email: "u@example.com",
  });
  mocks.findUser.mockResolvedValue({ stripeCustomerId: "cus_123" });
  mocks.createPortal.mockResolvedValue({
    url: "https://billing.stripe.test/session",
  });
});

describe("billing portal access", () => {
  it("rejects unauthenticated requests", async () => {
    mocks.getSession.mockResolvedValue(null);

    expect((await POST(request())).status).toBe(401);
    expect(mocks.createPortal).not.toHaveBeenCalled();
  });

  it("rejects accounts without a Stripe customer", async () => {
    mocks.findUser.mockResolvedValue({ stripeCustomerId: null });

    expect((await POST(request())).status).toBe(409);
    expect(mocks.createPortal).not.toHaveBeenCalled();
  });

  it("creates a portal for the authenticated account", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.createPortal).toHaveBeenCalledWith({
      customerId: "cus_123",
      returnUrl: "https://app.example.com/account",
    });
    await expect(response.json()).resolves.toEqual({
      url: "https://billing.stripe.test/session",
    });
  });
});

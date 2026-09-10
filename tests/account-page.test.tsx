import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  findUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUser } },
}));

import Account from "@/app/account/page";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({
    userId: "user-1",
    email: "u@example.com",
  });
});

describe("account billing settings", () => {
  it("shows the free plan without subscription management", async () => {
    mocks.findUser.mockResolvedValue({
      stripeCustomerId: null,
      subscriptions: [],
    });

    const html = renderToStaticMarkup(await Account());

    expect(html).toContain("Free · 3 basic scans per month");
    expect(html).not.toContain("MANAGE SUBSCRIPTION");
  });

  it("shows Pro and subscription management for a subscriber", async () => {
    mocks.findUser.mockResolvedValue({
      stripeCustomerId: "cus_123",
      subscriptions: [{ id: "sub-1" }],
    });

    const html = renderToStaticMarkup(await Account());

    expect(html).toContain("Pro · Unlimited scans");
    expect(html).toContain("MANAGE SUBSCRIPTION");
  });
});

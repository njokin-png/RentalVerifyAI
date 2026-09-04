import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  construct: vi.fn(),
  process: vi.fn(),
  config: vi.fn(),
}));
vi.mock("@/lib/env", () => ({ getStripeConfiguration: mocks.config }));
vi.mock("@/services/payments/provider", () => ({
  stripeClient: () => ({ webhooks: { constructEvent: mocks.construct } }),
}));
vi.mock("@/services/payments/webhook", () => ({
  processStripeEvent: mocks.process,
}));
import { POST } from "@/app/api/stripe/webhook/route";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.config.mockReturnValue({ webhookSecret: "whsec_test" });
  mocks.construct.mockReturnValue({
    id: "evt_1",
    type: "checkout.session.completed",
  });
  mocks.process.mockResolvedValue({ duplicate: false });
});
describe("Stripe webhook signatures", () => {
  it("rejects an invalid signature without processing", async () => {
    mocks.construct.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "bad" },
        body: "{}",
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.process).not.toHaveBeenCalled();
  });
  it("processes a signed raw event", async () => {
    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "signed" },
        body: "raw-body",
      }),
    );
    expect(response.status).toBe(200);
    expect(mocks.construct).toHaveBeenCalledWith(
      "raw-body",
      "signed",
      "whsec_test",
    );
    expect(mocks.process).toHaveBeenCalledTimes(1);
  });

  it("returns a safe error when a signed event cannot be persisted", async () => {
    mocks.process.mockRejectedValue(new Error("database unavailable"));
    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "signed" },
        body: "raw-body",
      }),
    );
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Webhook processing failed.",
    });
  });
});

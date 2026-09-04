import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const { transaction } = vi.hoisted(() => ({ transaction: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: { $transaction: transaction } }));

import { processStripeEvent } from "@/services/payments/webhook";

function duplicateError(target: string[]) {
  return new Prisma.PrismaClientKnownRequestError("duplicate", {
    code: "P2002",
    clientVersion: "5.22.0",
    meta: { target },
  });
}

function transactionWith(tx: Record<string, unknown>) {
  transaction.mockImplementationOnce(
    async (callback: (client: typeof tx) => Promise<void>) => callback(tx),
  );
}

describe("Stripe webhook payment integrity", () => {
  beforeEach(() => transaction.mockReset());

  it("acknowledges only a duplicate processed Stripe event", async () => {
    transaction.mockRejectedValueOnce(duplicateError(["id"]));
    await expect(
      processStripeEvent({
        id: "evt_replay",
        type: "checkout.session.completed",
      } as never),
    ).resolves.toEqual({ duplicate: true });
  });

  it("does not hide an unrelated unique database conflict", async () => {
    transaction.mockRejectedValueOnce(duplicateError(["checkoutSessionId"]));
    await expect(
      processStripeEvent({
        id: "evt_conflict",
        type: "checkout.session.completed",
      } as never),
    ).rejects.toThrow("duplicate");
  });

  it("fails closed when a report payment has the wrong amount", async () => {
    const tx = {
      stripeEvent: { create: vi.fn() },
      user: { update: vi.fn() },
      rentalScan: { findFirst: vi.fn().mockResolvedValue({ id: "scan-1" }) },
      payment: { upsert: vi.fn() },
    };
    transactionWith(tx);

    await expect(
      processStripeEvent({
        id: "evt_wrong_amount",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_report",
            payment_status: "paid",
            amount_total: 99,
            currency: "usd",
            metadata: { userId: "user-1", plan: "report", scanId: "scan-1" },
          },
        },
      } as never),
    ).rejects.toThrow("Report payment details are invalid");
    expect(tx.rentalScan.findFirst).not.toHaveBeenCalled();
    expect(tx.payment.upsert).not.toHaveBeenCalled();
  });

  it("records a valid report payment only for its owner's scan", async () => {
    const tx = {
      stripeEvent: { create: vi.fn() },
      user: { update: vi.fn() },
      rentalScan: { findFirst: vi.fn().mockResolvedValue({ id: "scan-1" }) },
      payment: { upsert: vi.fn() },
    };
    transactionWith(tx);

    await processStripeEvent({
      id: "evt_report",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_report",
          payment_status: "paid",
          amount_total: 499,
          currency: "usd",
          payment_intent: "pi_report",
          metadata: { userId: "user-1", plan: "report", scanId: "scan-1" },
        },
      },
    } as never);

    expect(tx.rentalScan.findFirst).toHaveBeenCalledWith({
      where: { id: "scan-1", userId: "user-1" },
      select: { id: true },
    });
    expect(tx.payment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ amount: 499, currency: "usd" }),
      }),
    );
  });

  it("keeps Pro pending until an authoritative subscription event arrives", async () => {
    const tx = {
      stripeEvent: { create: vi.fn() },
      user: { update: vi.fn() },
      subscription: { upsert: vi.fn() },
    };
    transactionWith(tx);

    await processStripeEvent({
      id: "evt_checkout",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_pro",
          subscription: "sub_1",
          metadata: { userId: "user-1", plan: "pro" },
        },
      },
    } as never);

    expect(tx.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: "pending" }),
        update: { userId: "user-1", checkoutSessionId: "cs_pro" },
      }),
    );
  });
});

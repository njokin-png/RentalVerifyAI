import { describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
const { transaction } = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: { $transaction: transaction } }));
import { processStripeEvent } from "@/services/payments/webhook";
describe("webhook idempotency", () => {
  it("treats a unique processed-event conflict as an acknowledged replay", async () => {
    transaction.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("duplicate", {
        code: "P2002",
        clientVersion: "5.22.0",
      }),
    );
    await expect(
      processStripeEvent({
        id: "evt_replay",
        type: "checkout.session.completed",
      } as never),
    ).resolves.toEqual({ duplicate: true });
  });
});

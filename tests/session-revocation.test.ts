import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";

const mocks = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUnique } },
}));

import { validateSessionToken, verifySessionToken } from "@/lib/auth";

async function token(sessionVersion?: number) {
  const payload: Record<string, unknown> = { email: "old@example.com" };
  if (sessionVersion !== undefined) payload.sessionVersion = sessionVersion;
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("user-1")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(
      new TextEncoder().encode(
        process.env.AUTH_SECRET || "development-secret-change-this-now-32",
      ),
    );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findUnique.mockResolvedValue({
    email: "current@example.com",
    sessionVersion: 2,
  });
});

describe("session revocation", () => {
  it("accepts a signed token with the current database version", async () => {
    await expect(validateSessionToken(await token(2))).resolves.toEqual({
      userId: "user-1",
      email: "current@example.com",
      sessionVersion: 2,
    });
  });

  it("rejects a signed token issued before the session version changed", async () => {
    await expect(validateSessionToken(await token(1))).resolves.toBeNull();
  });

  it("invalidates legacy tokens that predate versioned sessions", async () => {
    await expect(verifySessionToken(await token())).resolves.toBeNull();
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("fails closed if session validation storage is unavailable", async () => {
    mocks.findUnique.mockRejectedValue(new Error("database unavailable"));
    await expect(validateSessionToken(await token(2))).resolves.toBeNull();
  });
});

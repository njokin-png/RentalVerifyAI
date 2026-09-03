import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  consume: vi.fn(),
  update: vi.fn(),
  hash: vi.fn(),
}));

vi.mock("bcryptjs", () => ({ hash: mocks.hash }));
vi.mock("@/lib/account-tokens", () => ({
  consumeAccountToken: mocks.consume,
}));

import { POST } from "@/app/api/auth/reset-password/route";

function request() {
  return new NextRequest(
    "https://rentalverifyai.vercel.app/api/auth/reset-password",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://rentalverifyai.vercel.app",
      },
      body: JSON.stringify({
        token: "a-valid-reset-token-that-is-long-enough",
        password: "new-secure-password",
      }),
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.hash.mockResolvedValue("new-password-hash");
  mocks.update.mockResolvedValue({});
  mocks.consume.mockImplementation(
    async (_token: string, _type: unknown, apply: Function) =>
      apply({ user: { update: mocks.update } }, "user-1"),
  );
});

describe("password reset session revocation", () => {
  it("increments the session version and clears the current cookie", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        passwordHash: "new-password-hash",
        sessionVersion: { increment: 1 },
      },
    });
    expect(response.headers.get("set-cookie")).toMatch(/rv_session=;/);
    expect(response.headers.get("set-cookie")).toMatch(/Max-Age=0/);
  });

  it("does not revoke sessions for an invalid or expired token", async () => {
    mocks.consume.mockResolvedValue(null);
    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});

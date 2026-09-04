import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  deleteUserScans: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/services/scans/repository", () => ({
  deleteUserScans: mocks.deleteUserScans,
}));

import { DELETE } from "@/app/api/account/scans/route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ userId: "user-1" });
  mocks.deleteUserScans.mockResolvedValue(3);
});

describe("account investigation deletion", () => {
  it("requires authentication", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await DELETE();
    expect(response.status).toBe(401);
    expect(mocks.deleteUserScans).not.toHaveBeenCalled();
  });

  it("deletes all scans scoped to the authenticated user", async () => {
    const response = await DELETE();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ deleted: 3 });
    expect(mocks.deleteUserScans).toHaveBeenCalledWith("user-1");
  });

  it("fails closed when storage is unavailable", async () => {
    mocks.deleteUserScans.mockRejectedValue(new Error("database unavailable"));
    const response = await DELETE();
    expect(response.status).toBe(503);
  });
});

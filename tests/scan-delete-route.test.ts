import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  deleteOwnedScan: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/services/scans/repository", () => ({
  deleteOwnedScan: mocks.deleteOwnedScan,
}));

import { DELETE } from "@/app/api/scans/[id]/route";

function remove(id = "scan-1") {
  return DELETE(
    new Request(`http://localhost/api/scans/${id}`, { method: "DELETE" }),
    {
      params: { id },
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ userId: "user-1" });
  mocks.deleteOwnedScan.mockResolvedValue(true);
});

describe("saved investigation deletion", () => {
  it("requires an authenticated session", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await remove();
    expect(response.status).toBe(401);
    expect(mocks.deleteOwnedScan).not.toHaveBeenCalled();
  });

  it("deletes only through the owner-scoped repository operation", async () => {
    const response = await remove();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ deleted: true });
    expect(mocks.deleteOwnedScan).toHaveBeenCalledWith("scan-1", "user-1");
  });

  it("returns not found when the user does not own the scan", async () => {
    mocks.deleteOwnedScan.mockResolvedValue(false);
    const response = await remove();
    expect(response.status).toBe(404);
  });

  it("fails closed when storage is unavailable", async () => {
    mocks.deleteOwnedScan.mockRejectedValue(new Error("database unavailable"));
    const response = await remove();
    expect(response.status).toBe(503);
  });
});

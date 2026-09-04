import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ checkDatabaseReadiness: vi.fn() }));

vi.mock("@/lib/database-readiness", () => ({
  checkDatabaseReadiness: mocks.checkDatabaseReadiness,
}));

import { GET } from "@/app/api/ready/route";

describe("readiness endpoint", () => {
  beforeEach(() => mocks.checkDatabaseReadiness.mockReset());

  it("returns an uncached 200 when Neon is reachable", async () => {
    mocks.checkDatabaseReadiness.mockResolvedValue(true);
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ status: "ready" });
  });

  it("returns a safe 503 when Neon is unavailable", async () => {
    mocks.checkDatabaseReadiness.mockResolvedValue(false);
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toEqual({ status: "not_ready" });
    expect(JSON.stringify(body)).not.toMatch(/database|postgres|secret/i);
  });
});

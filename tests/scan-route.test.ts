import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { ScanResult } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  analyzeRental: vi.fn(),
  getSession: vi.fn(),
  saveScan: vi.fn(),
  set: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => true }));
vi.mock("@/services/scoring/analyze", () => ({
  analyzeRental: mocks.analyzeRental,
}));
vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/services/scans/repository", () => ({ saveScan: mocks.saveScan }));
vi.mock("@/lib/store", () => ({ scanStore: { set: mocks.set } }));

import { POST } from "@/app/api/scans/route";

const result = {
  id: "scan-1",
  input: { address: "123 Main St, San Diego, CA", advertisedRent: 1800 },
  score: 40,
  classification: "High Risk",
  confidence: "Low",
  checksCompleted: 1,
  checksUnavailable: 0,
  verificationGapDeduction: 0,
  signals: [],
  checks: [],
  recommendations: [],
  createdAt: "2026-08-23T00:00:00.000Z",
  reverseImageAvailable: true,
} satisfies ScanResult;

function request() {
  return new NextRequest("http://localhost/api/scans", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      address: result.input.address,
      advertisedRent: result.input.advertisedRent,
    }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  mocks.analyzeRental.mockResolvedValue(result);
  mocks.getSession.mockResolvedValue({ userId: "user-1" });
  mocks.saveScan.mockRejectedValue(new Error("database unavailable"));
  delete process.env.DEMO_MODE;
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.DEMO_MODE;
});

describe("scan persistence failures", () => {
  it("returns a safe 503 and never falls back to memory in production", async () => {
    const response = await POST(request());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Scan history is temporarily unavailable. Please try again.",
    });
    expect(mocks.saveScan).toHaveBeenCalledWith(result, "user-1");
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("uses the transient fallback only when demo mode is explicit", async () => {
    process.env.DEMO_MODE = "true";

    const response = await POST(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ id: "scan-1" });
    expect(mocks.set).toHaveBeenCalledWith("scan-1", result);
  });
});

import { describe, expect, it, vi } from "vitest";
import type { ScanInput } from "@/lib/types";
import {
  DemoRentProvider,
  RentCastRentProvider,
  UnavailableRentProvider,
  evaluateRent,
  getRentProvider,
} from "@/services/rent/provider";

const input: ScanInput = {
  address: "3206 Nile St, San Diego, CA 92104",
  zip: "92104",
  bedrooms: 2,
  bathrooms: 1,
  advertisedRent: 2500,
};

describe("rent provider selection", () => {
  it("uses demo data only when demo mode is explicit", () => {
    expect(
      getRentProvider({ DEMO_MODE: "true", RENTCAST_API_KEY: "secret" }),
    ).toBeInstanceOf(DemoRentProvider);
  });
  it("uses RentCast when demo mode is disabled and credentials exist", () => {
    expect(
      getRentProvider({ DEMO_MODE: "false", RENTCAST_API_KEY: "secret" }),
    ).toBeInstanceOf(RentCastRentProvider);
  });
  it("does not silently use demo data when production credentials are missing", () => {
    expect(
      getRentProvider({ DEMO_MODE: "false", RENTCAST_API_KEY: undefined }),
    ).toBeInstanceOf(UnavailableRentProvider);
  });
});

describe("RentCast normalization", () => {
  it("maps the live estimate, range, and comparable count", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            rent: 3123.6,
            rentRangeLow: 2900.2,
            rentRangeHigh: 3300.8,
            comparables: [{ id: 1 }, { id: 2 }],
          }),
          { status: 200 },
        ),
    );
    const result = await new RentCastRentProvider(
      "server-secret",
      fetchImpl as typeof fetch,
    ).estimate(input);
    expect(result).toEqual({
      status: "available",
      source: "rentcast",
      monthly: 3124,
      low: 2900,
      high: 3301,
      comparableCount: 2,
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(String(fetchImpl.mock.calls[0]?.[0])).toContain(
      "3206+Nile+St%2C+San+Diego%2C+CA+92104",
    );
  });
  it("returns unavailable evidence for a provider failure", async () => {
    const monitor = vi.fn();
    const fetchImpl = vi.fn(async () => new Response(null, { status: 401 }));
    const result = await new RentCastRentProvider(
      "bad-secret",
      fetchImpl as typeof fetch,
      5000,
      monitor,
    ).estimate(input);
    expect(result).toEqual({
      status: "unavailable",
      source: "rentcast",
      error: "Live market-rent lookup failed (401).",
    });
    expect(evaluateRent(input.advertisedRent, result).check.status).toBe(
      "unavailable",
    );
    expect(monitor).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "rentcast",
        operation: "rent_estimate",
        outcome: "http_error",
        statusCode: 401,
      }),
    );
    expect(JSON.stringify(monitor.mock.calls)).not.toContain(input.address);
    expect(JSON.stringify(monitor.mock.calls)).not.toContain("bad-secret");
  });
  it("uses live wording for a live estimate", () => {
    const result = evaluateRent(input.advertisedRent, {
      status: "available",
      source: "rentcast",
      monthly: 3200,
      low: 3000,
      high: 3400,
      comparableCount: 3,
    });
    expect(result.check.detail).toContain("Live estimate");
    expect(result.check.detail).not.toContain("Demo estimate");
  });
});

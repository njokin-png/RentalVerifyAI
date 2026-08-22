import { afterEach, describe, expect, it, vi } from "vitest";
import type { ScanInput } from "@/lib/types";
import { getPropertyProvider } from "@/services/property/factory";
import { DemoPropertyProvider } from "@/services/property/provider";
import { RentCastPropertyProvider } from "@/services/property/rentcast";
import { propertyChecks } from "@/services/property/checks";

const input: ScanInput = {
  address: "5500 Grand Lake Dr, San Antonio, TX 78244",
  advertisedRent: 1800,
};

const originalProvider = process.env.PROPERTY_PROVIDER;
const originalKey = process.env.RENTCAST_API_KEY;

afterEach(() => {
  process.env.PROPERTY_PROVIDER = originalProvider;
  process.env.RENTCAST_API_KEY = originalKey;
});

describe("property provider selection", () => {
  it("falls back to demo mode without credentials", () => {
    process.env.PROPERTY_PROVIDER = "rentcast";
    delete process.env.RENTCAST_API_KEY;
    expect(getPropertyProvider()).toBeInstanceOf(DemoPropertyProvider);
  });

  it("selects RentCast when configured", () => {
    process.env.PROPERTY_PROVIDER = "rentcast";
    process.env.RENTCAST_API_KEY = "test-key";
    expect(getPropertyProvider()).toBeInstanceOf(RentCastPropertyProvider);
  });
});

describe("RentCast normalization", () => {
  it("maps live property fields into verification checks", async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify([
          {
            formattedAddress: input.address,
            ownerNames: ["Example Owner"],
            assessorID: "APN-123",
            propertyType: "Single Family",
            bedrooms: 3,
            bathrooms: 2,
            squareFootage: 1600,
            yearBuilt: 1998,
            lastSaleDate: "2024-01-10",
            lastSalePrice: 425000,
          },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const result = await new RentCastPropertyProvider("secret", fetcher).verify(input);
    const checks = propertyChecks(input, result);

    expect(result.source).toBe("rentcast");
    expect(checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Address validation", status: "verified" }),
        expect.objectContaining({ name: "Ownership records", status: "verified" }),
        expect.objectContaining({ name: "Parcel / APN", status: "verified" }),
        expect.objectContaining({ name: "Property characteristics", status: "verified" }),
        expect.objectContaining({ name: "Sale history", status: "verified" }),
      ]),
    );
  });

  it("turns provider failures into unavailable checks without exposing secrets", async () => {
    const fetcher = vi.fn(async () => new Response("denied", { status: 500 }));
    const result = await new RentCastPropertyProvider("super-secret", fetcher).verify(input);
    const checks = propertyChecks(input, result);

    expect(result.error).toBe("Live property records are temporarily unavailable.");
    expect(JSON.stringify(result)).not.toContain("super-secret");
    expect(checks.every((check) => check.status === "unavailable")).toBe(true);
  });
});

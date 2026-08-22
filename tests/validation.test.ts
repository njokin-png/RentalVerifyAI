import { describe, it, expect } from "vitest";
import { scanSchema } from "@/lib/validation";
describe("scan input validation", () => {
  it("accepts a complete rental", () =>
    expect(
      scanSchema.safeParse({
        address: "123 Main Street",
        advertisedRent: 1800,
        email: "owner@example.com",
      }).success,
    ).toBe(true));
  it("rejects invalid prices and URLs", () =>
    expect(
      scanSchema.safeParse({
        address: "123 Main Street",
        advertisedRent: -1,
        listingUrl: "not-url",
      }).success,
    ).toBe(false));
  it("strips markup from user text", () =>
    expect(
      scanSchema.parse({
        address: "123 Main Street",
        advertisedRent: 1,
        listingText: "<script>x</script>Hello",
      }).listingText,
    ).toBe("xHello"));
});

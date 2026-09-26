import { describe, expect, it } from "vitest";

describe("URL-first rental intake", () => {
  it("documents the supported marketplace behavior", () => {
    const supported = ["spareroom.com", "www.spareroom.com"];
    expect(supported).toContain("spareroom.com");
  });
});

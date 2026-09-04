import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { getSiteUrl } from "@/lib/site-url";

describe("public search metadata", () => {
  it("normalizes the configured canonical origin and safely falls back", () => {
    expect(
      getSiteUrl({
        NEXT_PUBLIC_APP_URL: "https://example.com/path?query=1",
      }).toString(),
    ).toBe("https://example.com/");
    expect(getSiteUrl({ NEXT_PUBLIC_APP_URL: "not-a-url" }).toString()).toBe(
      "https://rentalverifyai.vercel.app/",
    );
    expect(
      getSiteUrl({ NEXT_PUBLIC_APP_URL: "http://insecure.example" }).toString(),
    ).toBe("https://rentalverifyai.vercel.app/");
  });

  it("publishes only public renter-facing pages in the sitemap", () => {
    const urls = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(urls).toEqual(["/", "/analyze", "/safety", "/about", "/pricing"]);
    expect(urls).not.toContain("/history");
    expect(urls).not.toContain("/results/");
  });

  it("keeps private and dynamic paths out of crawler access", () => {
    const rule = robots().rules;
    expect(Array.isArray(rule)).toBe(false);
    if (!Array.isArray(rule)) {
      expect(rule.allow).toBe("/");
      expect(rule.disallow).toEqual(
        expect.arrayContaining([
          "/api/",
          "/account",
          "/history",
          "/results/",
          "/report/",
        ]),
      );
    }
  });
});

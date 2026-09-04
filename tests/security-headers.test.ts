import { describe, expect, it } from "vitest";
import nextConfig from "../next.config.mjs";

describe("browser security headers", () => {
  it("applies the production baseline to every route", async () => {
    const rules = await nextConfig.headers?.();
    expect(rules?.[0].source).toBe("/:path*");

    const headers = Object.fromEntries(
      (rules?.[0].headers ?? []).map(({ key, value }) => [key, value]),
    );
    expect(headers).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Strict-Transport-Security": "max-age=31536000",
    });

    const noIndexSources = (rules ?? [])
      .filter((rule) =>
        rule.headers.some(
          ({ key, value }) =>
            key === "X-Robots-Tag" && value === "noindex, nofollow",
        ),
      )
      .map((rule) => rule.source);
    expect(noIndexSources).toEqual(
      expect.arrayContaining([
        "/api/:path*",
        "/account",
        "/history/:path*",
        "/results/:path*",
        "/report/:path*",
      ]),
    );
  });
});

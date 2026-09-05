import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { isSameOriginRequest } from "@/lib/csrf";
import { proxy } from "@/proxy";

function request(
  method: string,
  url = "https://rentalverifyai.vercel.app/api/scans",
  origin?: string,
) {
  return new Request(url, {
    method,
    headers: origin ? { origin } : undefined,
  });
}

describe("same-origin request protection", () => {
  it("accepts an unsafe request from the exact target origin", () => {
    expect(
      isSameOriginRequest(
        request("POST", undefined, "https://rentalverifyai.vercel.app"),
      ),
    ).toBe(true);
  });

  it("accepts a Vercel preview request only from that same preview", () => {
    expect(
      isSameOriginRequest(
        request(
          "POST",
          "https://rentalverifyai-git-csrf-hardening-njokin-png.vercel.app/api/scans",
          "https://rentalverifyai-git-csrf-hardening-njokin-png.vercel.app",
        ),
      ),
    ).toBe(true);
  });

  it("rejects cross-origin unsafe requests", () => {
    expect(
      isSameOriginRequest(request("POST", undefined, "https://evil.example")),
    ).toBe(false);
  });

  it("rejects unsafe requests with no Origin header", () => {
    expect(isSameOriginRequest(request("POST"))).toBe(false);
  });

  it("rejects malformed origins", () => {
    expect(isSameOriginRequest(request("DELETE", undefined, "not-a-url"))).toBe(
      false,
    );
  });

  it.each(["GET", "HEAD", "OPTIONS"])(
    "allows safe %s requests without an Origin header",
    (method) => {
      expect(isSameOriginRequest(request(method))).toBe(true);
    },
  );
});

describe("API middleware enforcement", () => {
  it("blocks a cross-origin browser API request", async () => {
    const response = await proxy(
      new NextRequest("https://rentalverifyai.vercel.app/api/scans", {
        method: "POST",
        headers: { origin: "https://evil.example" },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Request origin could not be verified.",
    });
  });

  it("allows a same-origin browser API request to continue", async () => {
    const response = await proxy(
      new NextRequest("https://rentalverifyai.vercel.app/api/scans", {
        method: "POST",
        headers: { origin: "https://rentalverifyai.vercel.app" },
      }),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("preserves Stripe's separately authenticated webhook", async () => {
    const response = await proxy(
      new NextRequest("https://rentalverifyai.vercel.app/api/stripe/webhook", {
        method: "POST",
      }),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});

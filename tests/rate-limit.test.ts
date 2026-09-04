import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getDistributedRateLimitConfiguration,
  rateLimit,
} from "@/lib/rate-limit";

describe("distributed rate limiting", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  it("accepts only a complete HTTPS server-side configuration", () => {
    expect(
      getDistributedRateLimitConfiguration({
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io/path",
        UPSTASH_REDIS_REST_TOKEN: "secret-token",
      }),
    ).toEqual({ url: "https://example.upstash.io", token: "secret-token" });
    expect(
      getDistributedRateLimitConfiguration({
        UPSTASH_REDIS_REST_URL: "http://example.test",
        UPSTASH_REDIS_REST_TOKEN: "secret-token",
      }),
    ).toBeNull();
    expect(
      getDistributedRateLimitConfiguration({
        KV_REST_API_URL: "https://example.test",
      }),
    ).toBeNull();
  });

  it("uses an atomic remote counter without sending a raw visitor key", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "secret-token";
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ result: 2 }), { status: 200 }),
      );

    await expect(rateLimit("login:203.0.113.5", 2, 60_000)).resolves.toBe(true);
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.upstash.io");
    expect(request?.headers).toMatchObject({
      authorization: "Bearer secret-token",
      "content-type": "application/json",
    });
    const body = String(request?.body);
    expect(body).toContain('"EVAL"');
    expect(body).not.toContain("203.0.113.5");
  });

  it("rejects a remote count above the limit", async () => {
    process.env.KV_REST_API_URL = "https://example.test";
    process.env.KV_REST_API_TOKEN = "secret-token";
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ result: 4 }), { status: 200 }),
    );
    await expect(rateLimit("signup:visitor", 3)).resolves.toBe(false);
  });

  it("retains bounded local protection when the provider fails", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "secret-token";
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("offline"));

    await expect(rateLimit("fallback-unique", 1)).resolves.toBe(true);
    await expect(rateLimit("fallback-unique", 1)).resolves.toBe(false);
  });
});

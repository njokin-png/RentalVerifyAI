import "server-only";
import { createHmac } from "node:crypto";
import { getAuthSecret, type Environment } from "@/lib/env";

type Entry = { count: number; reset: number };
type RedisResponse = { result?: unknown; error?: string };

const buckets = new Map<string, Entry>();
const SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
return count
`;

export type DistributedRateLimitConfiguration = {
  url: string;
  token: string;
};

export function getDistributedRateLimitConfiguration(
  env: Environment = process.env,
): DistributedRateLimitConfiguration | null {
  const url = (env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL || "").trim();
  const token = (
    env.UPSTASH_REDIS_REST_TOKEN ||
    env.KV_REST_API_TOKEN ||
    ""
  ).trim();
  if (!url || !token) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    return { url: parsed.origin, token };
  } catch {
    return null;
  }
}

function localRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const old = buckets.get(key);
  if (!old || old.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (old.count >= limit) return false;
  old.count++;
  return true;
}

function privateKey(key: string, windowMs: number) {
  const digest = createHmac("sha256", getAuthSecret())
    .update(key)
    .digest("hex");
  return `rentalverify:rate:${windowMs}:${digest}`;
}

async function distributedRateLimit(
  configuration: DistributedRateLimitConfiguration,
  key: string,
  limit: number,
  windowMs: number,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1_500);
  try {
    const response = await fetch(configuration.url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${configuration.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        SCRIPT,
        "1",
        privateKey(key, windowMs),
        String(windowMs),
      ]),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Distributed limiter request failed.");
    const payload = (await response.json()) as RedisResponse;
    if (payload.error || typeof payload.result !== "number")
      throw new Error("Distributed limiter response was invalid.");
    return payload.result <= limit;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Use an atomic shared counter when REST Redis is configured. Provider failures
 * degrade to the process-local limiter so an infrastructure outage cannot lock
 * every customer out of authentication and scanning.
 */
export async function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const configuration = getDistributedRateLimitConfiguration();
  if (configuration) {
    try {
      return await distributedRateLimit(configuration, key, limit, windowMs);
    } catch {
      // Keep a bounded local defense when the optional shared service is down.
    }
  }
  return localRateLimit(key, limit, windowMs);
}

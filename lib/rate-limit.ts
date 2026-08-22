type Entry = { count: number; reset: number };
const buckets = new Map<string, Entry>();
export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
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

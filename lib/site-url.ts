import type { Environment } from "@/lib/env";

const productionFallback = "https://rentalverifyai.vercel.app";

export function getSiteUrl(env: Environment = process.env) {
  try {
    const parsed = new URL(env.NEXT_PUBLIC_APP_URL || productionFallback);
    const localHttp =
      parsed.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(parsed.hostname);
    if (parsed.protocol !== "https:" && !localHttp) throw new Error();
    return new URL(parsed.origin);
  } catch {
    return new URL(productionFallback);
  }
}

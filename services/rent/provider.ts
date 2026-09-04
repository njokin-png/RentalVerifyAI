import type { Check, RiskSignalInput, ScanInput } from "@/lib/types";
import {
  recordProviderEvent,
  type ProviderMonitor,
  type ProviderOutcome,
} from "@/lib/provider-monitoring";

export type RentEstimate =
  | {
      status: "available";
      source: "demo" | "rentcast";
      monthly: number;
      low?: number;
      high?: number;
      comparableCount?: number;
    }
  | { status: "unavailable"; source: "rentcast" | "none"; error: string };

export interface RentComparableProvider {
  estimate(input: ScanInput): Promise<RentEstimate>;
}

const markets: Record<string, number> = {
  "941": 3200,
  "100": 3400,
  "606": 2100,
  "787": 1950,
  "981": 2500,
};

export class DemoRentProvider implements RentComparableProvider {
  async estimate(input: ScanInput): Promise<RentEstimate> {
    const key = (
      input.zip ||
      input.address.match(/\b\d{5}\b/)?.[0] ||
      ""
    ).slice(0, 3);
    return {
      status: "available",
      source: "demo",
      monthly: markets[key] ?? Math.round(input.advertisedRent * 1.08),
    };
  }
}

export class UnavailableRentProvider implements RentComparableProvider {
  async estimate(): Promise<RentEstimate> {
    return {
      status: "unavailable",
      source: "none",
      error: "Live market-rent data is not configured.",
    };
  }
}

type RentCastResponse = {
  rent?: number;
  rentRangeLow?: number;
  rentRangeHigh?: number;
  comparables?: unknown[];
};

export class RentCastRentProvider implements RentComparableProvider {
  constructor(
    private readonly apiKey: string,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly timeoutMs = 5000,
    private readonly monitor: ProviderMonitor = recordProviderEvent,
  ) {}

  async estimate(input: ScanInput): Promise<RentEstimate> {
    const url = new URL("https://api.rentcast.io/v1/avm/rent/long-term");
    url.searchParams.set("address", input.address);
    if (input.bedrooms != null)
      url.searchParams.set("bedrooms", String(input.bedrooms));
    if (input.bathrooms != null)
      url.searchParams.set("bathrooms", String(input.bathrooms));
    const controller = new AbortController();
    const startedAt = Date.now();
    const report = (outcome: ProviderOutcome, statusCode?: number) =>
      this.monitor({
        provider: "rentcast",
        operation: "rent_estimate",
        outcome,
        durationMs: Date.now() - startedAt,
        statusCode,
      });
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(url, {
        headers: { "X-Api-Key": this.apiKey, Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) {
        report("http_error", response.status);
        return {
          status: "unavailable",
          source: "rentcast",
          error: `Live market-rent lookup failed (${response.status}).`,
        };
      }
      let data: RentCastResponse;
      try {
        data = (await response.json()) as RentCastResponse;
      } catch {
        report("invalid_response", response.status);
        return {
          status: "unavailable",
          source: "rentcast",
          error: "The live provider returned no usable rent estimate.",
        };
      }
      if (typeof data.rent !== "number" || data.rent <= 0) {
        report("invalid_response", response.status);
        return {
          status: "unavailable",
          source: "rentcast",
          error: "The live provider returned no usable rent estimate.",
        };
      }
      report("success", response.status);
      return {
        status: "available",
        source: "rentcast",
        monthly: Math.round(data.rent),
        low:
          typeof data.rentRangeLow === "number"
            ? Math.round(data.rentRangeLow)
            : undefined,
        high:
          typeof data.rentRangeHigh === "number"
            ? Math.round(data.rentRangeHigh)
            : undefined,
        comparableCount: Array.isArray(data.comparables)
          ? data.comparables.length
          : undefined,
      };
    } catch {
      report(controller.signal.aborted ? "timeout" : "network_error");
      return {
        status: "unavailable",
        source: "rentcast",
        error: "Live market-rent data was temporarily unavailable.",
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

type RentEnvironment = {
  DEMO_MODE?: string;
  RENTCAST_API_KEY?: string;
};

export function getRentProvider(
  env?: RentEnvironment,
  fetchImpl: typeof fetch = fetch,
): RentComparableProvider {
  const current = env ?? {
    DEMO_MODE: process.env.DEMO_MODE,
    RENTCAST_API_KEY: process.env.RENTCAST_API_KEY,
  };
  if (current.DEMO_MODE?.trim().toLowerCase() === "true")
    return new DemoRentProvider();
  const apiKey = current.RENTCAST_API_KEY?.trim();
  return apiKey
    ? new RentCastRentProvider(apiKey, fetchImpl)
    : new UnavailableRentProvider();
}

export function evaluateRent(
  advertised: number,
  estimate: RentEstimate,
): { check: Check; signal?: RiskSignalInput; difference?: number } {
  if (estimate.status === "unavailable")
    return {
      check: {
        name: "Market rent comparison",
        status: "unavailable",
        detail: estimate.error,
        category: "rent",
      },
    };
  const difference = Math.round(
    ((estimate.monthly - advertised) / estimate.monthly) * 100,
  );
  const providerLabel = estimate.source === "rentcast" ? "Live" : "Demo";
  const sourceDescription =
    estimate.source === "rentcast" ? "live market estimate" : "demo estimate";
  const signal =
    difference >= 35
      ? {
          code: "RENT_ANOMALY",
          title: "Rent significantly below estimate",
          explanation: `Advertised rent is ${difference}% below the ${sourceDescription}. Low rent is one signal, not proof of fraud.`,
          severity: "high" as const,
          category: "rent",
          deduction: 12,
        }
      : difference >= 20
        ? {
            code: "RENT_BELOW",
            title: "Rent below estimate",
            explanation: `Advertised rent is ${difference}% below the ${sourceDescription}; verify the reason.`,
            severity: "medium" as const,
            category: "rent",
            deduction: 7,
          }
        : undefined;
  const range =
    estimate.low != null && estimate.high != null
      ? ` (range $${estimate.low.toLocaleString()}–$${estimate.high.toLocaleString()})`
      : "";
  const comparables =
    estimate.comparableCount != null
      ? ` · ${estimate.comparableCount} comparable${estimate.comparableCount === 1 ? "" : "s"}`
      : "";
  return {
    check: {
      name: "Market rent comparison",
      status: "verified",
      detail: `${providerLabel} estimate: $${estimate.monthly.toLocaleString()}/month${range}${comparables} (${Math.max(0, difference)}% below estimate).`,
      category: "rent",
    },
    signal,
    difference,
  };
}

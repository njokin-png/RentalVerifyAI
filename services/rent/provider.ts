import type { Check, RiskSignalInput, ScanInput } from "@/lib/types";
export interface RentComparableProvider {
  estimate(input: ScanInput): Promise<number | null>;
}
const markets: Record<string, number> = {
  "941": 3200,
  "100": 3400,
  "606": 2100,
  "787": 1950,
  "981": 2500,
};
export class DemoRentProvider implements RentComparableProvider {
  async estimate(i: ScanInput) {
    const key = (i.zip || i.address.match(/\b\d{5}\b/)?.[0] || "").slice(0, 3);
    return markets[key] ?? Math.round(i.advertisedRent * 1.08);
  }
}
export function evaluateRent(
  advertised: number,
  estimated: number | null,
): { check: Check; signal?: RiskSignalInput; difference?: number } {
  if (!estimated)
    return {
      check: {
        name: "Market rent comparison",
        status: "unavailable",
        detail: "No comparable data was available.",
        category: "rent",
      },
    };
  const difference = Math.round(((estimated - advertised) / estimated) * 100);
  const signal =
    difference >= 35
      ? {
          code: "RENT_ANOMALY",
          title: "Rent significantly below estimate",
          explanation: `Advertised rent is ${difference}% below the demo market estimate. Low rent is one signal, not proof of fraud.`,
          severity: "high" as const,
          category: "rent",
          deduction: 12,
        }
      : difference >= 20
        ? {
            code: "RENT_BELOW",
            title: "Rent below estimate",
            explanation: `Advertised rent is ${difference}% below the demo estimate; verify the reason.`,
            severity: "medium" as const,
            category: "rent",
            deduction: 7,
          }
        : undefined;
  return {
    check: {
      name: "Market rent comparison",
      status: "verified",
      detail: `Demo estimate: $${estimated.toLocaleString()}/month (${Math.max(0, difference)}% below estimate).`,
      category: "rent",
    },
    signal,
    difference,
  };
}

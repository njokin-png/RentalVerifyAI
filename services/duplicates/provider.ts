import type { Check, RiskSignalInput, ScanInput } from "@/lib/types";

export interface DuplicateListingProvider {
  search(
    i: ScanInput,
  ): Promise<{ checks: Check[]; signals: RiskSignalInput[] }>;
}

export class DemoDuplicateProvider implements DuplicateListingProvider {
  async search(
    i: ScanInput,
  ): Promise<{ checks: Check[]; signals: RiskSignalInput[] }> {
    if (process.env.DEMO_MODE !== "true")
      return {
        checks: [
          {
            name: "Duplicate listing search",
            status: "unavailable",
            detail:
              "Public web duplicate search is not configured. Compare this listing independently on other sites.",
            category: "duplicate",
          },
        ],
        signals: [],
      };
    const copied = /copied|too good to be true/i.test(i.listingText || "");
    return {
      checks: [
        {
          name: "Duplicate listing search",
          status: copied ? "mismatch" : "unavailable",
          detail: copied
            ? "Demo match found with different contact details."
            : "Public web duplicate search requires a configured provider.",
          category: "duplicate",
        },
      ],
      signals: copied
        ? [
            {
              code: "DUPLICATE_CONTACT",
              title: "Possible duplicate with changed contact",
              explanation:
                "Demo comparison indicates similar listing text associated with different contact details.",
              severity: "high",
              category: "duplicate",
              deduction: 14,
            },
          ]
        : [],
    };
  }
}

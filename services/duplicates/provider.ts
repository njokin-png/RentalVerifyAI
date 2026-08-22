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

import type { Check, ScanInput } from "@/lib/types";
export interface PropertyProvider {
  verify(input: ScanInput): Promise<Check[]>;
}
export class DemoPropertyProvider implements PropertyProvider {
  async verify(i: ScanInput) {
    return [
      {
        name: "Address format",
        status:
          i.address.length > 8
            ? ("verified" as const)
            : ("unverified" as const),
        detail:
          "Address passed basic format validation; ownership is not confirmed.",
        category: "property",
      },
      {
        name: "Ownership records",
        status: "unavailable" as const,
        detail:
          "Connect a local records or property-data provider to verify ownership.",
        category: "property",
      },
      {
        name: "Parcel and tax data",
        status: "unavailable" as const,
        detail: "Not available in demo mode.",
        category: "property",
      },
    ];
  }
}

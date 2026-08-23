import type { ScanInput } from "@/lib/types";
import type { PropertyProvider } from "./provider-interface";
import type { PropertyRecord, PropertyVerificationResult } from "./types";

type RentCastRecord = {
  formattedAddress?: string;
  ownerNames?: string[];
  assessorID?: string;
  assessorId?: string;
  parcelNumber?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  saleHistory?: Record<string, { salePrice?: number; saleDate?: string }>;
};

function normalize(record: RentCastRecord): PropertyRecord {
  const history = record.saleHistory
    ? Object.entries(record.saleHistory).sort(([a], [b]) => b.localeCompare(a))[0]
    : undefined;
  const historyDate = history?.[1]?.saleDate || history?.[0];
  return {
    formattedAddress: record.formattedAddress,
    ownerNames: record.ownerNames,
    parcelId: record.assessorID || record.assessorId || record.parcelNumber,
    propertyType: record.propertyType,
    bedrooms: record.bedrooms,
    bathrooms: record.bathrooms,
    squareFootage: record.squareFootage,
    lotSize: record.lotSize,
    yearBuilt: record.yearBuilt,
    lastSaleDate: record.lastSaleDate || historyDate,
    lastSalePrice: record.lastSalePrice ?? history?.[1]?.salePrice,
  };
}

export class RentCastPropertyProvider implements PropertyProvider {
  constructor(
    private readonly apiKey: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async verify(input: ScanInput): Promise<PropertyVerificationResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const url = new URL("https://api.rentcast.io/v1/properties");
      url.searchParams.set("address", input.address);
      url.searchParams.set("limit", "1");
      const response = await this.fetcher(url, {
        headers: { Accept: "application/json", "X-Api-Key": this.apiKey },
        signal: controller.signal,
      });
      if (!response.ok) {
        return {
          source: "rentcast",
          error: "Live property records are temporarily unavailable.",
        };
      }
      const payload = (await response.json()) as unknown;
      if (!Array.isArray(payload) || !payload.length || typeof payload[0] !== "object") {
        return {
          source: "rentcast",
          error: "No matching live property record was returned.",
        };
      }
      return { source: "rentcast", record: normalize(payload[0] as RentCastRecord) };
    } catch {
      return {
        source: "rentcast",
        error: "Live property records are temporarily unavailable.",
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

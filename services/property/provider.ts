import type { ScanInput } from "@/lib/types";
import type { PropertyProvider } from "./provider-interface";
import type { PropertyVerificationResult } from "./types";

export class DemoPropertyProvider implements PropertyProvider {
  async verify(input: ScanInput): Promise<PropertyVerificationResult> {
    const usableAddress = input.address.trim().length > 8;
    return usableAddress
      ? {
          source: "demo",
          record: { formattedAddress: input.address.trim() },
        }
      : {
          source: "demo",
          error: "Address could not be validated in demo mode.",
        };
  }
}

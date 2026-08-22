import type { ScanInput } from "@/lib/types";
import type { PropertyVerificationResult } from "./types";

export interface PropertyProvider {
  verify(input: ScanInput): Promise<PropertyVerificationResult>;
}

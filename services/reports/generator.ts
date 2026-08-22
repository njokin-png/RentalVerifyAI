import type { ScanResult } from "@/lib/types";
export function reportData(scan: ScanResult) {
  return {
    title: "RentalVerify AI Investigation Report",
    generatedAt: new Date().toISOString(),
    disclaimer:
      "This informational risk assessment is not a guarantee that a listing is legitimate or fraudulent.",
    property: {
      address: scan.input.address,
      rent: scan.input.advertisedRent,
      source: scan.input.listingUrl || "Not supplied",
    },
    contact: {
      name: scan.input.landlordName || "Not supplied",
      company: scan.input.company || "Not supplied",
      phone: scan.input.phone || "Not supplied",
      email: scan.input.email || "Not supplied",
    },
    assessment: {
      score: scan.score,
      classification: scan.classification,
      confidence: scan.confidence,
    },
    signals: scan.signals,
    checks: scan.checks,
    recommendations: scan.recommendations,
  };
}

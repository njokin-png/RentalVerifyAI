import type { ScanResult } from "./types";
const base = (
  id: string,
  address: string,
  rent: number,
  score: number,
  classification: string,
  title?: string,
): ScanResult => ({
  id,
  input: { address, advertisedRent: rent, listingText: title || "" },
  score,
  classification,
  confidence: "High",
  checksCompleted: 7,
  checksUnavailable: 3,
  verificationGapDeduction: 12,
  signals: title
    ? [
        {
          code: id,
          title,
          explanation:
            "This demo scenario illustrates how a transparent signal affects the assessment.",
          severity: score < 45 ? "critical" : "high",
          category: "listing",
          deduction: 100 - score,
        },
      ]
    : [],
  checks: [
    {
      name: "Address format",
      status: "verified",
      detail: "Basic address structure validated.",
      category: "property",
    },
    {
      name: "Market rent comparison",
      status: "verified",
      detail: "Compared with seeded demo market data.",
      category: "rent",
    },
    {
      name: "Ownership records",
      status: "unavailable",
      detail: "External property provider not configured.",
      category: "property",
    },
    {
      name: "Reverse image verification",
      status: "unavailable",
      detail: "Reverse-image provider not configured.",
      category: "image",
    },
  ],
  recommendations: [
    "Verify ownership independently using local property records.",
    "Tour the property before paying or sharing sensitive information.",
    "Call the company using an independently located official number.",
    "Avoid irreversible payment methods.",
  ],
  estimatedRent: rent * 1.1,
  createdAt: "2026-08-22T12:00:00.000Z",
  reverseImageAvailable: false,
});
export const demoScans = [
  base(
    "demo-low",
    "48 Harbor Way, San Francisco, CA 94107",
    2800,
    96,
    "Low Risk",
  ),
  base(
    "demo-payment",
    "810 Cedar Ave, Chicago, IL 60614",
    1500,
    51,
    "Moderate Risk",
    "Payment requested before a tour",
  ),
  base(
    "demo-mismatch",
    "220 Pine St, Austin, TX 78701",
    1700,
    63,
    "Moderate Risk",
    "Owner and contact details do not match",
  ),
  base(
    "demo-rent",
    "15 West 72nd St, New York, NY 10023",
    1200,
    39,
    "High Risk",
    "Rent dramatically below demo market estimate",
  ),
  base(
    "demo-copy",
    "901 Lakeview Blvd, Seattle, WA 98101",
    1300,
    24,
    "High Risk",
    "Possible copied listing with different contact",
  ),
];
export const getDemoScan = (id: string) => demoScans.find((s) => s.id === id);

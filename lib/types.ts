export type Severity = "low" | "medium" | "high" | "critical";
export type RiskSignalInput = {
  code: string;
  title: string;
  explanation: string;
  severity: Severity;
  category: string;
  evidence?: string;
  deduction: number;
};
export type ScanInput = {
  listingUrl?: string;
  listingText?: string;
  address: string;
  zip?: string;
  bedrooms?: number;
  bathrooms?: number;
  advertisedRent: number;
  landlordName?: string;
  phone?: string;
  email?: string;
  company?: string;
  conversation?: string;
  saveReport?: boolean;
};
export type Check = {
  name: string;
  status: "verified" | "unverified" | "unavailable" | "mismatch";
  detail: string;
  category: string;
};
export type ScanResult = {
  id: string;
  input: ScanInput;
  score: number;
  classification: string;
  confidence: "Low" | "Medium" | "High";
  checksCompleted: number;
  checksUnavailable: number;
  signals: RiskSignalInput[];
  checks: Check[];
  recommendations: string[];
  estimatedRent?: number;
  rentDifferencePercent?: number;
  createdAt: string;
  reverseImageAvailable: boolean;
};

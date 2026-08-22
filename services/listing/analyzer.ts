import type { RiskSignalInput } from "@/lib/types";
type Rule = {
  code: string;
  pattern: RegExp;
  title: string;
  explanation: string;
  severity: RiskSignalInput["severity"];
  category: string;
  deduction: number;
};
export const listingRules: Rule[] = [
  {
    code: "PAY_WIRE",
    pattern: /wire transfer|western union|moneygram/i,
    title: "Irreversible payment requested",
    explanation:
      "The listing requests a payment method that can be difficult to recover.",
    severity: "critical",
    category: "payment",
    deduction: 22,
  },
  {
    code: "PAY_ALT",
    pattern: /\bzelle\b|cash\s?app|gift card|bitcoin|crypto/i,
    title: "Unusual payment channel",
    explanation:
      "Payment through peer-to-peer apps, gift cards, or cryptocurrency reduces consumer protections.",
    severity: "high",
    category: "payment",
    deduction: 16,
  },
  {
    code: "BEFORE_TOUR",
    pattern:
      /(deposit|pay|fee).{0,40}(before|prior to).{0,20}(tour|view|show)|before.{0,20}(tour|view).{0,30}(deposit|pay|fee)/i,
    title: "Payment before viewing",
    explanation:
      "Money is requested before the renter can tour or independently verify the property.",
    severity: "critical",
    category: "payment",
    deduction: 20,
  },
  {
    code: "OVERSEAS",
    pattern: /overseas|out of (town|state|country)|missionary|working abroad/i,
    title: "Remote landlord claim",
    explanation:
      "The contact says they cannot meet because they are away; independently verify their identity and authority.",
    severity: "medium",
    category: "identity",
    deduction: 8,
  },
  {
    code: "URGENCY",
    pattern:
      /act (now|fast)|today only|immediately|many (other )?(renters|applicants)|won't last|send (it|money) now/i,
    title: "Pressure or urgency",
    explanation:
      "The language pressures the renter to act before completing normal checks.",
    severity: "medium",
    category: "communication",
    deduction: 8,
  },
  {
    code: "NO_TOUR",
    pattern:
      /cannot (show|meet)|no (tour|viewing)|drive by only|won't be able to show/i,
    title: "Tour or meeting refused",
    explanation:
      "The contact appears unwilling or unable to arrange an in-person or live-video tour.",
    severity: "high",
    category: "property",
    deduction: 14,
  },
  {
    code: "EARLY_INFO",
    pattern: /social security|ssn|passport|bank account|photo of your id/i,
    title: "Sensitive information requested",
    explanation:
      "Sensitive identity or financial information may be requested earlier than necessary.",
    severity: "high",
    category: "communication",
    deduction: 13,
  },
  {
    code: "COPIED",
    pattern:
      /below market.{0,30}serious inquiries only|kindly get back to me urgently/i,
    title: "Potentially templated language",
    explanation:
      "Phrasing resembles language frequently reused across deceptive listings; this signal is not conclusive alone.",
    severity: "low",
    category: "listing",
    deduction: 4,
  },
];
export function analyzeText(text = "") {
  return listingRules
    .filter((r) => r.pattern.test(text))
    .map(({ pattern, ...signal }) => ({
      ...signal,
      evidence: (text.match(pattern)?.[0] || "").slice(0, 120),
    }));
}

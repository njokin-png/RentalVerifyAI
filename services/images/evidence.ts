import type { OcrEvidence, OcrEvidenceType } from "./provider";

const patterns: Array<[OcrEvidenceType, RegExp]> = [
  ["email", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
  ["phone", /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g],
  [
    "price",
    /(?:\$\s?\d{3,5}(?:[,.]\d{2})?|\b\d{3,5}\s?(?:USD|per month|\/month|monthly)\b)/gi,
  ],
  [
    "address",
    /\b\d{1,6}\s+[A-Za-z0-9.' -]{2,60}\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way)\b(?:[^\n,]{0,30})?/gi,
  ],
  [
    "payment_pressure",
    /\b(?:pay|send|wire|transfer)\b[^.!?\n]{0,70}\b(?:now|today|immediately|before (?:the )?(?:tour|viewing)|urgent(?:ly)?)\b/gi,
  ],
];

export function extractRentalEvidence(text: string): OcrEvidence[] {
  const normalized = text.replace(/\s+/g, " ").trim().slice(0, 20_000);
  const evidence: OcrEvidence[] = [];
  for (const [type, pattern] of patterns) {
    for (const match of normalized.matchAll(pattern)) {
      const value = match[0].trim().slice(0, 200);
      if (
        !evidence.some(
          (item) =>
            item.type === type &&
            item.value.toLowerCase() === value.toLowerCase(),
        )
      )
        evidence.push({ type, value });
      if (evidence.length >= 20) return evidence;
    }
  }
  const nameMatches = normalized.matchAll(
    /(?:contact|landlord|manager|agent)\s*[:\-]\s*([A-Z][a-z'-]+\s+[A-Z][a-z'-]+)/gi,
  );
  for (const match of nameMatches) {
    evidence.push({ type: "name", value: match[1].slice(0, 150) });
    if (evidence.length >= 20) break;
  }
  return evidence;
}

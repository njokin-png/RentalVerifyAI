import type { Check, RiskSignalInput, ScanInput } from "@/lib/types";
export interface ContactVerificationProvider {
  verify(
    input: ScanInput,
  ): Promise<{ checks: Check[]; signals: RiskSignalInput[] }>;
}
export class DemoContactProvider implements ContactVerificationProvider {
  async verify(i: ScanInput) {
    const checks: Check[] = [];
    const signals: RiskSignalInput[] = [];
    checks.push({
      name: "Contact supplied",
      status: i.email || i.phone ? "verified" : "unverified",
      detail:
        i.email || i.phone
          ? "At least one contact method was supplied."
          : "No email or phone was supplied.",
      category: "contact",
    });
    if (i.email && /gmail|yahoo|outlook/i.test(i.email) && i.company) {
      signals.push({
        code: "FREE_COMPANY_EMAIL",
        title: "Company uses a consumer email",
        explanation:
          "The stated company is paired with a free email domain. Confirm using the company’s independently located website.",
        severity: "low",
        category: "contact",
        deduction: 4,
      });
    }
    return { checks, signals };
  }
}

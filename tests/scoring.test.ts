import { describe, it, expect } from "vitest";
import { calculateScore } from "@/services/scoring/engine";
import type { Check, RiskSignalInput } from "@/lib/types";
const checks: Check[] = [
  { name: "a", status: "verified", detail: "", category: "property" },
  { name: "b", status: "unavailable", detail: "", category: "image" },
];
describe("transparent scoring", () => {
  it("starts at 100 and deducts configured signal values", () => {
    const signals: RiskSignalInput[] = [
      {
        code: "x",
        title: "x",
        explanation: "x",
        severity: "medium",
        category: "rent",
        deduction: 7,
      },
    ];
    expect(calculateScore(signals, checks)).toMatchObject({
      score: 93,
      classification: "Low Risk",
      checksCompleted: 1,
      checksUnavailable: 1,
    });
  });
  it("clamps at zero", () => {
    const s = Array.from({ length: 10 }, (_, i) => ({
      code: String(i),
      title: "x",
      explanation: "x",
      severity: "critical" as const,
      category: "payment",
      deduction: 25,
    }));
    expect(calculateScore(s, checks).score).toBe(0);
  });
});

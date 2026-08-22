import { describe, it, expect } from "vitest";
import { calculateScore } from "@/services/scoring/engine";
import type { Check, RiskSignalInput } from "@/lib/types";
const checks: Check[] = [
  { name: "a", status: "verified", detail: "", category: "property" },
  { name: "b", status: "unavailable", detail: "", category: "image" },
];
describe("transparent scoring", () => {
  it("deducts both configured signal values and unavailable checks", () => {
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
      score: 89,
      classification: "Some Concerns",
      checksCompleted: 1,
      checksUnavailable: 1,
      verificationGapDeduction: 4,
    });
  });
  it("does not present missing verification as a perfect low-risk score", () => {
    const incompleteChecks: Check[] = [
      { name: "address", status: "verified", detail: "", category: "property" },
      { name: "rent", status: "verified", detail: "", category: "rent" },
      {
        name: "owner",
        status: "unavailable",
        detail: "",
        category: "identity",
      },
      {
        name: "parcel",
        status: "unavailable",
        detail: "",
        category: "property",
      },
      {
        name: "duplicate",
        status: "unavailable",
        detail: "",
        category: "duplicate",
      },
      { name: "image", status: "unavailable", detail: "", category: "image" },
    ];

    expect(calculateScore([], incompleteChecks)).toMatchObject({
      score: 84,
      classification: "Some Concerns",
      confidence: "Low",
      checksUnavailable: 4,
      verificationGapDeduction: 16,
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

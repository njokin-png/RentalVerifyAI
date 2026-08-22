import { scoringConfig } from "./config";
import type { Check, RiskSignalInput } from "@/lib/types";
export function calculateScore(signals: RiskSignalInput[], checks: Check[]) {
  const deduction = signals.reduce(
    (n, s) => n + Math.min(s.deduction, scoringConfig.severityCaps[s.severity]),
    0,
  );
  const score = Math.max(0, Math.min(100, scoringConfig.baseScore - deduction));
  const classification = scoringConfig.classification.find(
    (x) => score >= x.min,
  )!.label;
  const available = checks.filter((x) => x.status !== "unavailable").length;
  const verified = checks.filter((x) => x.status === "verified").length;
  const confidence: "Low" | "Medium" | "High" =
    available >= 7 && verified >= 3
      ? "High"
      : available >= 4
        ? "Medium"
        : "Low";
  return {
    score,
    classification,
    confidence,
    checksCompleted: available,
    checksUnavailable: checks.length - available,
  };
}

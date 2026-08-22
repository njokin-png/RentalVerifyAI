import { describe, it, expect } from "vitest";
import { reportData } from "@/services/reports/generator";
import { demoScans } from "@/lib/demo";
describe("report generation", () => {
  it("includes assessment, source, next steps and disclaimer", () => {
    const r = reportData(demoScans[0]);
    expect(r.assessment.score).toBe(96);
    expect(r.property.address).toContain("Harbor");
    expect(r.recommendations.length).toBeGreaterThan(2);
    expect(r.disclaimer).toContain("not a guarantee");
  });
  it("uses analyzed wording without implying reviewed messages were verified", () => {
    const scan = {
      ...demoScans[0],
      checks: [
        {
          name: "Communication review",
          status: "analyzed" as const,
          detail: "Messages were checked against explainable risk rules.",
          category: "communication",
        },
        {
          name: "Ownership records",
          status: "unavailable" as const,
          detail: "Provider not configured.",
          category: "property",
        },
      ],
    };
    const report = reportData(scan);
    expect(report.checks[0].statusLabel).toBe("Analyzed");
    expect(report.checks[0].statusLabel).not.toBe("Verified");
    expect(report.checks[1].statusLabel).toBe("Unavailable");
  });
});

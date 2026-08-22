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
});

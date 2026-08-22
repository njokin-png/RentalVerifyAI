import { describe, it, expect } from "vitest";
import { analyzeText } from "@/services/listing/analyzer";
describe("listing and communication rules", () => {
  it("returns separate explainable payment signals", () => {
    const r = analyzeText(
      "I am overseas. Send the deposit by Western Union before the tour today.",
    );
    expect(r.map((x) => x.code)).toContain("PAY_WIRE");
    expect(r.map((x) => x.code)).toContain("OVERSEAS");
    expect(r.every((x) => x.explanation.length > 10)).toBe(true);
  });
  it("does not score grammar alone", () => {
    expect(analyzeText("hello i has apartment nice place").length).toBe(0);
  });
});

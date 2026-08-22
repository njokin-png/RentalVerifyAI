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
  it.each([
    "Pay today to reserve it",
    "Send the deposit today",
    "Transfer the payment immediately",
  ])("detects immediate payment pressure in: %s", (message) => {
    const signal = analyzeText(message).find(
      (item) => item.code === "PAYMENT_PRESSURE",
    );
    expect(signal).toMatchObject({
      title: "Immediate payment pressure",
      category: "payment",
    });
    expect(signal?.evidence).toMatch(/today|immediately/i);
  });
  it.each(["Other renters are waiting", "Act now", "Today only"])(
    "detects urgency in: %s",
    (message) => {
      expect(analyzeText(message).map((item) => item.code)).toContain(
        "URGENCY",
      );
    },
  );
  it("preserves the existing Zelle, cannot-show, and out-of-town signals", () => {
    const codes = analyzeText(
      "I am out of town and cannot show the property. Pay with Zelle.",
    ).map((item) => item.code);
    expect(codes).toEqual(
      expect.arrayContaining(["PAY_ALT", "OVERSEAS", "NO_TOUR"]),
    );
  });
});

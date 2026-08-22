import { describe, it, expect } from "vitest";
import { analyzeRental } from "@/services/scoring/analyze";
describe("rental scan creation", () => {
  it("creates a deterministic, explainable scan", async () => {
    const r = await analyzeRental(
      {
        address: "15 West 72nd St, New York, NY 10023",
        zip: "10023",
        advertisedRent: 1200,
        conversation: "Wire the deposit before the tour",
      },
      "test-id",
    );
    expect(r.id).toBe("test-id");
    expect(r.score).toBeLessThan(70);
    expect(r.signals.length).toBeGreaterThan(0);
    expect(r.estimatedRent).toBe(3400);
  });
});

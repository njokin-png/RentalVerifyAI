import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { analyzeRental } from "@/services/scoring/analyze";
describe("rental scan creation", () => {
  const originalDemoMode = process.env.DEMO_MODE;

  beforeEach(() => {
    process.env.DEMO_MODE = "true";
  });

  afterEach(() => {
    if (originalDemoMode === undefined) delete process.env.DEMO_MODE;
    else process.env.DEMO_MODE = originalDemoMode;
  });

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
  it("reduces score and confidence when clean input has verification gaps", async () => {
    const result = await analyzeRental(
      {
        address: "48 Harbor Way, San Francisco, CA 94107",
        zip: "94107",
        advertisedRent: 3200,
      },
      "clean-incomplete",
    );

    expect(result.signals).toHaveLength(0);
    expect(result.checksUnavailable).toBeGreaterThanOrEqual(3);
    expect(result.verificationGapDeduction).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(90);
    expect(result.classification).not.toBe("Low Risk");
    expect(result.confidence).toBe("Low");
  });
  it("marks supplied communication as analyzed rather than verified", async () => {
    const result = await analyzeRental(
      {
        address: "48 Harbor Way, San Francisco, CA 94107",
        advertisedRent: 3000,
        conversation: "Please let me know when you can tour.",
      },
      "communication-status",
    );
    expect(
      result.checks.find((check) => check.name === "Communication review")
        ?.status,
    ).toBe("analyzed");
  });
});

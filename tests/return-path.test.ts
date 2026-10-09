import { describe, expect, it } from "vitest";
import { safeReturnPath } from "@/lib/return-path";
describe("authentication return path", () => {
  it("keeps the selected report and checkout query", () => {
    expect(safeReturnPath("/pricing?scanId=scan-1")).toBe(
      "/pricing?scanId=scan-1",
    );
    expect(safeReturnPath("/checkout/success?session_id=cs_test_1")).toBe(
      "/checkout/success?session_id=cs_test_1",
    );
  });
  it.each([
    undefined,
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/\nevil.test",
  ])("rejects external or malformed destinations: %s", (value) => {
    expect(safeReturnPath(value)).toBe("/dashboard");
  });
});

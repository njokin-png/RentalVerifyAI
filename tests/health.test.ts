import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("health endpoint", () => {
  it("returns a small, non-cached response without configuration values", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ status: "ok", configuration: "valid" });
    expect(JSON.stringify(body)).not.toContain("DATABASE_URL");
  });
});

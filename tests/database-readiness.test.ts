import { describe, expect, it, vi } from "vitest";
import { checkDatabaseReadiness } from "@/lib/database-readiness";

describe("database readiness", () => {
  it("reports ready when the database query succeeds", async () => {
    await expect(checkDatabaseReadiness(async () => 1)).resolves.toBe(true);
  });

  it("fails closed without exposing a database error", async () => {
    await expect(
      checkDatabaseReadiness(async () => {
        throw new Error("postgresql://secret@database.example/app");
      }),
    ).resolves.toBe(false);
  });

  it("fails closed when the database does not respond in time", async () => {
    vi.useFakeTimers();
    const result = checkDatabaseReadiness(
      () => new Promise(() => undefined),
      100,
    );

    await vi.advanceTimersByTimeAsync(100);
    await expect(result).resolves.toBe(false);
    vi.useRealTimers();
  });
});

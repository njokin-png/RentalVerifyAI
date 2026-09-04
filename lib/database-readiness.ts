import { prisma } from "@/lib/prisma";

export const DATABASE_READINESS_TIMEOUT_MS = 3_000;

type ReadinessQuery = () => Promise<unknown>;

export async function checkDatabaseReadiness(
  query: ReadinessQuery = () => prisma.$queryRaw`SELECT 1`,
  timeoutMs = DATABASE_READINESS_TIMEOUT_MS,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      query(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Database readiness check timed out")),
          timeoutMs,
        );
      }),
    ]);
    return true;
  } catch {
    return false;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

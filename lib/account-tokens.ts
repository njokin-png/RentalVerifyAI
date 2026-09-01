import { createHash, randomBytes } from "crypto";
import { AccountTokenType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAccountToken(
  userId: string,
  type: AccountTokenType,
) {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const ttl =
    type === AccountTokenType.EMAIL_VERIFICATION
      ? VERIFICATION_TTL_MS
      : RESET_TTL_MS;

  await prisma.$transaction([
    prisma.accountToken.deleteMany({
      where: { userId, type, usedAt: null },
    }),
    prisma.accountToken.create({
      data: {
        userId,
        type,
        tokenHash,
        expiresAt: new Date(Date.now() + ttl),
      },
    }),
  ]);

  return rawToken;
}

export async function useAccountToken<T>(
  rawToken: string,
  type: AccountTokenType,
  apply: (tx: Prisma.TransactionClient, userId: string) => Promise<T>,
): Promise<T | null> {
  if (!rawToken || rawToken.length > 512) return null;
  const tokenHash = hashToken(rawToken);

  return prisma.$transaction(async (tx) => {
    const token = await tx.accountToken.findUnique({ where: { tokenHash } });
    if (
      !token ||
      token.type !== type ||
      token.usedAt ||
      token.expiresAt <= new Date()
    ) {
      return null;
    }

    const claimed = await tx.accountToken.updateMany({
      where: {
        id: token.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    });
    if (claimed.count !== 1) return null;

    return apply(tx, token.userId);
  });
}

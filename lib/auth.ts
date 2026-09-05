import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { getAuthSecret } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  verifySessionToken,
} from "@/lib/session-token";

export {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  verifySessionToken,
} from "@/lib/session-token";

export async function createSession(user: {
  id: string;
  email: string;
  sessionVersion: number;
}) {
  const token = await new SignJWT({
    email: user.email,
    sessionVersion: user.sessionVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAuthSecret());
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 604800,
  });
}

export async function validateSessionToken(token?: string) {
  const session = await verifySessionToken(token);
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, sessionVersion: true },
    });
    if (!user || user.sessionVersion !== session.sessionVersion) return null;
    return { ...session, email: user.email };
  } catch {
    return null;
  }
}

export async function getSession() {
  return validateSessionToken(
    (await cookies()).get(SESSION_COOKIE_NAME)?.value,
  );
}

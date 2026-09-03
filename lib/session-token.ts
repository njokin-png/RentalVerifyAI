import { jwtVerify } from "jose";
import { getAuthSecret } from "@/lib/env";

export const SESSION_COOKIE_NAME = "rv_session";
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export type Session = {
  userId: string;
  email: string;
  sessionVersion: number;
};

export async function verifySessionToken(
  token?: string,
): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (
      !payload.sub ||
      typeof payload.email !== "string" ||
      !Number.isInteger(payload.sessionVersion) ||
      Number(payload.sessionVersion) < 0
    )
      return null;
    return {
      userId: payload.sub,
      email: payload.email,
      sessionVersion: Number(payload.sessionVersion),
    };
  } catch {
    return null;
  }
}

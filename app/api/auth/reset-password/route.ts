import { AccountTokenType } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { consumeAccountToken } from "@/lib/account-tokens";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

const resetSchema = z.object({
  token: z.string().min(20).max(512),
  password: z.string().min(10).max(128),
});

export async function POST(req: NextRequest) {
  const parsed = resetSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "The reset link or password is invalid." },
      { status: 400 },
    );
  }

  try {
    const passwordHash = await hash(parsed.data.password, 12);
    const changed = await consumeAccountToken(
      parsed.data.token,
      AccountTokenType.PASSWORD_RESET,
      async (tx, userId) => {
        await tx.user.update({
          where: { id: userId },
          data: { passwordHash, sessionVersion: { increment: 1 } },
        });
        return true;
      },
    );
    if (!changed) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      ...SESSION_COOKIE_OPTIONS,
      expires: new Date(0),
      maxAge: 0,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Password reset is temporarily unavailable." },
      { status: 503 },
    );
  }
}

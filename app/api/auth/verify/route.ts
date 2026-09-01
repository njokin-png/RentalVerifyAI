import { AccountTokenType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { useAccountToken } from "@/lib/account-tokens";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  try {
    const verified = await useAccountToken(
      token,
      AccountTokenType.EMAIL_VERIFICATION,
      async (tx, userId) => {
        await tx.user.update({
          where: { id: userId },
          data: { emailVerifiedAt: new Date() },
        });
        return true;
      },
    );
    return NextResponse.redirect(
      new URL(`/verify?status=${verified ? "success" : "invalid"}`, req.url),
    );
  } catch {
    return NextResponse.redirect(new URL("/verify?status=unavailable", req.url));
  }
}

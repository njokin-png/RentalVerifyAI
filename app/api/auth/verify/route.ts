import { AccountTokenType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { consumeAccountToken } from "@/lib/account-tokens";
import { recordSecurityEvent } from "@/lib/security-audit";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  try {
    const verified = await consumeAccountToken(
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
    recordSecurityEvent({
      action: "email_verification",
      outcome: verified ? "success" : "rejected",
    });
    return NextResponse.redirect(
      new URL(`/verify?status=${verified ? "success" : "invalid"}`, req.url),
    );
  } catch {
    recordSecurityEvent({ action: "email_verification", outcome: "error" });
    return NextResponse.redirect(
      new URL("/verify?status=unavailable", req.url),
    );
  }
}

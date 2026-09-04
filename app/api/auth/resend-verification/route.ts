import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/account-email";

const requestSchema = z.object({ email: z.string().email().toLowerCase() });
const generic = {
  ok: true,
  message:
    "If that account can receive verification email, a message will be sent.",
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!(await rateLimit(`verify-resend:${ip}`, 3, 15 * 60_000))) {
    return NextResponse.json(generic);
  }
  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(generic);
  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (user && !user.emailVerifiedAt) await sendVerificationEmail(user);
  } catch {
    // Preserve the generic response to avoid account enumeration or provider leakage.
  }
  return NextResponse.json(generic);
}

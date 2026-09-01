import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/account-email";

const requestSchema = z.object({ email: z.string().email().toLowerCase() });
const generic = {
  ok: true,
  message: "If an account exists for that email, a reset message will be sent.",
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`password-reset:${ip}`, 3, 15 * 60_000)) {
    return NextResponse.json(generic);
  }
  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(generic);
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user) await sendPasswordResetEmail(user);
  } catch {
    // Keep response indistinguishable for unknown users, provider failures, and DB errors.
  }
  return NextResponse.json(generic);
}

import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { credentialsSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { recordSecurityEvent } from "@/lib/security-audit";
export async function POST(req: NextRequest) {
  if (
    !rateLimit(
      `login:${req.headers.get("x-forwarded-for") || "local"}`,
      8,
      300000,
    )
  ) {
    recordSecurityEvent({ action: "login", outcome: "rate_limited" });
    return NextResponse.json(
      { error: "Please try again later." },
      { status: 429 },
    );
  }
  const p = credentialsSchema.omit({ name: true }).safeParse(await req.json());
  if (!p.success) {
    recordSecurityEvent({ action: "login", outcome: "rejected" });
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: p.data.email },
    });
    if (!user || !(await compare(p.data.password, user.passwordHash))) {
      recordSecurityEvent({ action: "login", outcome: "rejected" });
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }
    await createSession(user);
    recordSecurityEvent({
      action: "login",
      outcome: "success",
      actorId: user.id,
    });
    return NextResponse.json({ ok: true });
  } catch {
    recordSecurityEvent({ action: "login", outcome: "error" });
    return NextResponse.json(
      { error: "Login is temporarily unavailable." },
      { status: 503 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { credentialsSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
export async function POST(req: NextRequest) {
  if (
    !rateLimit(
      `signup:${req.headers.get("x-forwarded-for") || "local"}`,
      5,
      300000,
    )
  )
    return NextResponse.json(
      { error: "Please try again later." },
      { status: 429 },
    );
  const p = credentialsSchema.safeParse(await req.json());
  if (!p.success)
    return NextResponse.json(
      { error: "Use a valid email and password of at least 10 characters." },
      { status: 400 },
    );
  try {
    const user = await prisma.user.create({
      data: {
        email: p.data.email,
        name: p.data.name,
        passwordHash: await hash(p.data.password, 12),
      },
    });
    await createSession(user);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to create account. The email may already be registered.",
      },
      { status: 400 },
    );
  }
}

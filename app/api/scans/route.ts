import { NextRequest, NextResponse } from "next/server";
import { scanSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { analyzeRental } from "@/services/scoring/analyze";
import { scanStore } from "@/lib/store";
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`scan:${ip}`, 10))
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429 },
    );
  try {
    const parsed = scanSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          error: "Please correct the submitted rental details.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    const result = await analyzeRental(parsed.data);
    scanStore.set(result.id, result);
    return NextResponse.json({
      id: result.id,
      score: result.score,
      classification: result.classification,
    });
  } catch {
    return NextResponse.json(
      { error: "The analysis could not be completed safely." },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { scanSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { analyzeRental } from "@/services/scoring/analyze";
import { scanStore } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { saveScan } from "@/services/scans/repository";

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
    const session = await getSession();

    try {
      await saveScan(result, session?.userId);
    } catch {
      if (process.env.DEMO_MODE === "true") {
        scanStore.set(result.id, result);
      } else {
        return NextResponse.json(
          { error: "Scan history is temporarily unavailable. Please try again." },
          { status: 503 },
        );
      }
    }

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

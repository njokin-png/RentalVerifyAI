import { NextRequest, NextResponse } from "next/server";
import { scanSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { analyzeRental } from "@/services/scoring/analyze";
import { scanStore } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { saveScan } from "@/services/scans/repository";
import { validateImageFiles } from "@/services/images/provider";
import { canCreateScan } from "@/services/payments/entitlements";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!(await rateLimit(`scan:${ip}`, 10)))
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429 },
    );

  try {
    const session = await getSession();
    const entitlement = await canCreateScan(session?.userId);
    if (!entitlement.allowed)
      return NextResponse.json(
        {
          error:
            "You have used all 3 free scans this month. Upgrade to Pro for unlimited scans.",
        },
        { status: 403 },
      );
    const contentType = req.headers.get("content-type") || "";
    let candidate: unknown;
    let images: File[] = [];
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      images = form
        .getAll("images")
        .filter(
          (value): value is File => value instanceof File && value.size > 0,
        );
      const imageError = validateImageFiles(images);
      if (imageError)
        return NextResponse.json({ error: imageError }, { status: 400 });
      candidate = Object.fromEntries(
        Array.from(form.entries()).filter(
          ([key, value]) => key !== "images" && typeof value === "string",
        ),
      );
    } else {
      candidate = await req.json();
    }
    const parsed = scanSchema.safeParse(candidate);
    if (!parsed.success)
      return NextResponse.json(
        {
          error: "Please correct the submitted rental details.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );

    const result = await analyzeRental(parsed.data, undefined, images);
    try {
      await saveScan(result, session?.userId);
    } catch (error) {
      console.error("Save scan error:", error);
      if (process.env.DEMO_MODE === "true") {
        scanStore.set(result.id, result);
      } else {
        return NextResponse.json(
          {
            error: "Scan history is temporarily unavailable. Please try again.",
          },
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

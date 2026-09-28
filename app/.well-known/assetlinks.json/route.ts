import { NextResponse } from "next/server";
import { createAndroidAssetLinks } from "@/lib/android-asset-links";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    createAndroidAssetLinks(
      process.env.ANDROID_SHA256_CERT_FINGERPRINTS,
    ),
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}

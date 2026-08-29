import { NextResponse } from "next/server";
import { validateProductionEnvironment } from "@/lib/env";

export const dynamic = "force-dynamic";

export function GET() {
  const production = process.env.NODE_ENV === "production";
  const configuration = production
    ? validateProductionEnvironment()
    : { ok: true as const };

  return NextResponse.json(
    {
      status: configuration.ok ? "ok" : "misconfigured",
      configuration: configuration.ok ? "valid" : "invalid",
    },
    {
      status: configuration.ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

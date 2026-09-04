import { NextResponse } from "next/server";
import { checkDatabaseReadiness } from "@/lib/database-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const ready = await checkDatabaseReadiness();

  return NextResponse.json(
    { status: ready ? "ready" : "not_ready" },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

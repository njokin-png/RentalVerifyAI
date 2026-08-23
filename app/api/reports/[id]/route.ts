import { NextResponse } from "next/server";
import { scanStore } from "@/lib/store";
import { getDemoScan } from "@/lib/demo";
import { getSession } from "@/lib/auth";
import { getScan } from "@/services/scans/repository";
import { reportData } from "@/services/reports/generator";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  let scan = scanStore.get(params.id) || getDemoScan(params.id);

  if (!scan) {
    try {
      scan = (await getScan(params.id, session?.userId)) ?? undefined;
    } catch {
      return NextResponse.json(
        { error: "Report storage is temporarily unavailable." },
        { status: 503 },
      );
    }
  }

  return scan
    ? NextResponse.json(reportData(scan))
    : NextResponse.json({ error: "Report not found" }, { status: 404 });
}

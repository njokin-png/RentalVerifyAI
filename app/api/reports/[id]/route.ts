import { NextResponse } from "next/server";
import { scanStore } from "@/lib/store";
import { getDemoScan } from "@/lib/demo";
import { reportData } from "@/services/reports/generator";
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const scan = scanStore.get(params.id) || getDemoScan(params.id);
  return scan
    ? NextResponse.json(reportData(scan))
    : NextResponse.json({ error: "Report not found" }, { status: 404 });
}

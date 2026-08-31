import { NextResponse } from "next/server";
import { scanStore } from "@/lib/store";
import { getDemoScan } from "@/lib/demo";
import { getSession } from "@/lib/auth";
import { getOwnedScan } from "@/services/scans/repository";
import { reportData } from "@/services/reports/generator";
import { canAccessPaidReport } from "@/services/payments/entitlements";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  let scan = scanStore.get(params.id) || getDemoScan(params.id);

  if (!scan) {
    if (!session)
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    try {
      scan = (await getOwnedScan(params.id, session.userId)) ?? undefined;
    } catch {
      return NextResponse.json(
        { error: "Report storage is temporarily unavailable." },
        { status: 503 },
      );
    }
  }

  if (
    scan &&
    !scanStore.has(params.id) &&
    !getDemoScan(params.id) &&
    session &&
    !(await canAccessPaidReport(session.userId, params.id))
  ) {
    return NextResponse.json(
      { error: "A report purchase or Pro plan is required." },
      { status: 402 },
    );
  }

  return scan
    ? NextResponse.json(reportData(scan))
    : NextResponse.json({ error: "Report not found" }, { status: 404 });
}

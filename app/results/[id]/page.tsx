import { notFound } from "next/navigation";
import { scanStore } from "@/lib/store";
import { ResultsView } from "@/components/ResultsView";
import { getDemoScan } from "@/lib/demo";
import { getSession } from "@/lib/auth";
import { getScan } from "@/services/scans/repository";
import { canAccessPaidReport } from "@/services/payments/entitlements";

export default async function Results({ params }: { params: { id: string } }) {
  const session = await getSession();
  let scan = scanStore.get(params.id) || getDemoScan(params.id);

  if (!scan) {
    try {
      scan = (await getScan(params.id, session?.userId)) ?? undefined;
    } catch {
      scan = undefined;
    }
  }

  if (!scan) notFound();
  const reportAccess = Boolean(
    getDemoScan(params.id) ||
    scanStore.has(params.id) ||
    (session && (await canAccessPaidReport(session.userId, params.id))),
  );
  return (
    <div className="container py-12">
      <ResultsView scan={scan} reportAccess={reportAccess} />
    </div>
  );
}

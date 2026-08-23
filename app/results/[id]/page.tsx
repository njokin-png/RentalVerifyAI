import { notFound } from "next/navigation";
import { scanStore } from "@/lib/store";
import { ResultsView } from "@/components/ResultsView";
import { getDemoScan } from "@/lib/demo";
import { getSession } from "@/lib/auth";
import { getScan } from "@/services/scans/repository";

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
  return (
    <div className="container py-12">
      <ResultsView scan={scan} />
    </div>
  );
}

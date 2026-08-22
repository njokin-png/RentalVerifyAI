import { notFound } from "next/navigation";
import { scanStore } from "@/lib/store";
import { ResultsView } from "@/components/ResultsView";
import { getDemoScan } from "@/lib/demo";
export default function Results({ params }: { params: { id: string } }) {
  const scan = scanStore.get(params.id) || getDemoScan(params.id);
  if (!scan) notFound();
  return (
    <div className="container py-12">
      <ResultsView scan={scan} />
    </div>
  );
}

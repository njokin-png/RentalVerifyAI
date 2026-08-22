import { AnalyzeForm } from "@/components/AnalyzeForm";
import { Disclaimer } from "@/components/Disclaimer";
export default function Analyze() {
  return (
    <div className="container max-w-4xl py-12">
      <p className="eyebrow">RENTAL RISK CHECK</p>
      <h1 className="text-4xl font-extrabold mt-2">Analyze a rental</h1>
      <p className="text-slate-600 mt-3 mb-7">
        Add what you know. More complete information can improve assessment
        confidence.
      </p>
      <AnalyzeForm />
      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}

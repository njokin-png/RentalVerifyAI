import { Info } from "lucide-react";
export function Disclaimer() {
  return (
    <div className="rounded-xl bg-sky-50 border border-sky-200 p-4 text-sm text-slate-700 flex gap-3">
      <Info className="text-sky-700 shrink-0" size={20} />
      <p>
        <b>Informational assessment only.</b> The Rental Trust Score highlights
        risk signals and verification gaps. It is not a guarantee that a listing
        is legitimate or fraudulent. Independently verify a property and contact
        before sending money or personal information.
      </p>
    </div>
  );
}

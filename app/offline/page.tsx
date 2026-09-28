import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <section className="container py-20">
      <div className="card mx-auto max-w-xl p-8 text-center">
        <WifiOff className="mx-auto text-teal" size={48} />
        <h1 className="mt-5 text-3xl font-extrabold">You are offline</h1>
        <p className="mt-3 text-slate-600">
          Rental checks need an internet connection so current listing and
          property information can be reviewed. Reconnect, then try again.
        </p>
        <Link className="btn mt-7" href="/analyze">
          TRY AGAIN
        </Link>
      </div>
    </section>
  );
}

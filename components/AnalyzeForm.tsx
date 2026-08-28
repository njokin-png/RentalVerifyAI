"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Lock, Loader2 } from "lucide-react";
export function AnalyzeForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not analyze listing");
      router.push(`/results/${json.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-7">
      <section className="card p-6">
        <h2 className="text-xl font-extrabold">1. Property and listing</h2>
        <div className="grid md:grid-cols-2 gap-5 mt-5">
          <label>
            <span className="label">Property address *</span>
            <input
              required
              name="address"
              className="input"
              placeholder="123 Main St, City, ST 12345"
            />
          </label>
          <label>
            <span className="label">Listing URL</span>
            <input
              name="listingUrl"
              type="url"
              className="input"
              placeholder="https://..."
            />
          </label>
          <label>
            <span className="label">Advertised monthly rent *</span>
            <input
              required
              name="advertisedRent"
              type="number"
              min="1"
              className="input"
              placeholder="1800"
            />
          </label>
          <label>
            <span className="label">ZIP code</span>
            <input
              name="zip"
              className="input"
              pattern="[0-9]{5}(-[0-9]{4})?"
              placeholder="12345"
            />
          </label>
          <label>
            <span className="label">Bedrooms</span>
            <input
              name="bedrooms"
              type="number"
              min="0"
              step="1"
              className="input"
            />
          </label>
          <label>
            <span className="label">Bathrooms</span>
            <input
              name="bathrooms"
              type="number"
              min="0"
              step="0.5"
              className="input"
            />
          </label>
        </div>
        <label className="block mt-5">
          <span className="label">Listing text</span>
          <textarea
            name="listingText"
            className="input min-h-36"
            maxLength={20000}
            placeholder="Paste the full listing description..."
          />
        </label>
      </section>
      <section className="card p-6">
        <h2 className="text-xl font-extrabold">2. Contact details</h2>
        <div className="grid md:grid-cols-2 gap-5 mt-5">
          <label>
            <span className="label">Landlord / manager name</span>
            <input name="landlordName" className="input" />
          </label>
          <label>
            <span className="label">Company name</span>
            <input name="company" className="input" />
          </label>
          <label>
            <span className="label">Phone</span>
            <input name="phone" className="input" />
          </label>
          <label>
            <span className="label">Email</span>
            <input name="email" type="email" className="input" />
          </label>
        </div>
      </section>
      <section className="card p-6">
        <h2 className="text-xl font-extrabold">3. Messages and images</h2>
        <div className="bg-amber-50 border border-amber-200 text-sm p-4 rounded-xl mt-4 flex gap-2">
          <Lock size={18} className="shrink-0" />
          <p>
            <b>Privacy notice:</b> Remove Social Security numbers, bank details,
            IDs, and other sensitive data. Conversations are analyzed
            transiently and are not retained unless you explicitly save a
            report.
          </p>
        </div>
        <label className="block mt-5">
          <span className="label">Conversation text or emails</span>
          <textarea
            name="conversation"
            maxLength={30000}
            className="input min-h-36"
            placeholder="Paste relevant messages..."
          />
        </label>
        <label className="mt-5 border-2 border-dashed border-slate-300 rounded-xl p-7 flex flex-col items-center text-center text-slate-600">
          <Upload />
          <b className="mt-2">Add screenshots or property photos</b>
          <span className="text-xs mt-1">JPG, PNG, or WebP · 5 MB each</span>
          <input
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="mt-3 text-sm"
          />
          <span className="text-xs mt-2">
            Images are analyzed transiently on the server and are not stored.
            Demo mode returns deterministic demonstration results.
          </span>
        </label>
      </section>
      {error && (
        <p role="alert" className="text-red-700 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}
      <button disabled={busy} className="btn w-full text-lg py-4">
        {busy ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            ANALYZING…
          </>
        ) : (
          "CHECK THIS RENTAL"
        )}
      </button>
    </form>
  );
}

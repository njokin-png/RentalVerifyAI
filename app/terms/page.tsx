import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Read the RentalVerify AI terms for informational rental-listing assessments and optional paid services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="container py-16 max-w-4xl">
      <p className="eyebrow">TERMS</p>
      <h1 className="text-4xl font-extrabold mt-2">Terms of Service</h1>
      <p className="text-sm text-slate-500 mt-3">Effective September 7, 2026</p>

      <div className="mt-10 space-y-8 text-slate-700 leading-7">
        <section>
          <h2 className="text-xl font-bold text-navy">Informational service only</h2>
          <p className="mt-2">
            RentalVerify AI helps you review rental-listing information and
            identify warning signs before you send money or personal information.
            Results are informational assessments, not legal, financial, real
            estate, law-enforcement, or consumer-protection advice. A score,
            provider result, image finding, or missing result does not prove that
            a listing is legitimate or fraudulent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">Your responsibility</h2>
          <p className="mt-2">
            You are responsible for the information you submit and for your
            decisions. Do not submit information you do not have the right to
            share, and do not use the service to harass, discriminate against, or
            violate another person&apos;s privacy or the law. Independently verify a
            landlord, property, lease, and payment method before paying or
            sharing sensitive information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">Availability and third parties</h2>
          <p className="mt-2">
            Some checks depend on optional third-party providers and may be
            unavailable, delayed, incomplete, or incorrect. We may change,
            suspend, or discontinue features as the service develops. A
            third-party provider&apos;s availability or data does not create a
            guarantee by RentalVerify AI.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">Free and optional paid services</h2>
          <p className="mt-2">
            Free scans are subject to the usage limits shown in the app. The
            service may offer an optional one-time Rental Verify Report and an
            optional Pro plan. Paid checkout is available only when it is shown
            as active in the app. If payment is enabled, charges and access are
            handled through Stripe after successful payment confirmation.
          </p>
          <p className="mt-2">
            Prices, included features, renewal terms, and availability are shown
            at checkout. Do not rely on a payment option until the app presents
            an active checkout flow.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">No warranties and limits</h2>
          <p className="mt-2">
            To the fullest extent allowed by law, the service is provided
            &quot;as is&quot; and &quot;as available&quot; without warranties of any kind.
            RentalVerify AI is not responsible for decisions, transactions,
            losses, or disputes arising from a rental listing or from reliance on
            an assessment. These terms do not limit rights that cannot legally be
            limited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">Privacy</h2>
          <p className="mt-2">
            Our handling of submitted information and account data is described
            in the <Link className="text-teal underline" href="/privacy">Privacy Policy</Link>.
            By using the service, you agree to these terms and acknowledge that
            you have read that policy.
          </p>
        </section>
      </div>
    </div>
  );
}

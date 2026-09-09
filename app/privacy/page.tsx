import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Learn how RentalVerify AI handles rental-check information, account data, and your privacy choices.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="container py-16 max-w-4xl">
      <p className="eyebrow">PRIVACY</p>
      <h1 className="text-4xl font-extrabold mt-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mt-3">Effective September 7, 2026</p>

      <div className="mt-10 space-y-8 text-slate-700 leading-7">
        <section>
          <h2 className="text-xl font-bold text-navy">What this service does</h2>
          <p className="mt-2">
            RentalVerify AI provides an informational rental-listing assessment.
            It identifies warning signs from the information you submit; it does
            not guarantee that a listing is legitimate or fraudulent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">Information you submit</h2>
          <p className="mt-2">
            A rental check may include listing details such as an address, rent,
            bedrooms, bathrooms, ZIP code, contact details, message text, and
            optional images. We use that information to run the requested
            assessment and generate its Trust Score and verification checks.
          </p>
          <p className="mt-2">
            Uploaded images are processed transiently for the requested OCR and
            reverse-image checks. The image files themselves are not written to
            application storage. OCR findings and possible image matches are
            investigative leads, not proof of fraud or legitimacy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">What may be saved</h2>
          <p className="mt-2">
            Completed scans can be saved with their listing, verification, score,
            and report data. If you are signed in, saved investigations are
            associated with your account so you can reopen them. Anonymous scans
            may be available only as permitted by the app&apos;s current session
            and access controls.
          </p>
          <p className="mt-2">
            Conversation text is not retained for an ordinary scan. It is saved
            only when you explicitly choose to save a report. Report snapshots
            follow the same opt-in rule.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">Your choices</h2>
          <p className="mt-2">
            Signed-in users can permanently delete individual saved
            investigations from their dashboard or history. Account settings also
            include a control to delete all saved investigations for that account.
            Those controls remove associated scan and report records while
            preserving the account and any subscription or payment records needed
            to operate the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">Service providers and security</h2>
          <p className="mt-2">
            We use service providers to operate the app, including hosting,
            database, payment, email, and optional property or image-analysis
            providers. Provider integrations are server-side. Payment processing,
            when enabled, is handled by Stripe. We use reasonable safeguards such
            as encrypted HTTPS connections, access controls, input validation,
            and rate limiting, but no online service can promise absolute
            security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">Cookies and changes</h2>
          <p className="mt-2">
            The app uses essential cookies to keep signed-in sessions working.
            We do not sell submitted rental information. We may update this
            policy as the service changes; the effective date above will show
            when it was last revised.
          </p>
        </section>
      </div>
    </div>
  );
}

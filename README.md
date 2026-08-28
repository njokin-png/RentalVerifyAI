# RentalVerify AI

A runnable MVP for explainable rental-listing risk assessment. It combines deterministic listing and communication rules, provider-neutral verification services, a transparent weighted score, printable investigation reports, authenticated dashboard/history routes, and seeded demo scenarios. Results use risk language and never claim that a listing is fraudulent based on warning signs alone.

## Architecture

- **Next.js App Router + TypeScript + Tailwind:** responsive public pages, analysis workflow, results, dashboard, history, account, and print/PDF-ready report.
- **Server routes:** validated scan creation and authentication; secrets and provider calls stay server-side.
- **Services:** provider-neutral adapters under `services/property`, `listing`, `contact`, `images`, `ai`, `rent`, `duplicates`, `payments`, `reports`, `scans`, and `scoring`.
- **Scoring:** deterministic deductions and classification thresholds live in `services/scoring/config.ts`; each signal includes evidence and an explanation.
- **Data/auth:** PostgreSQL models through Prisma, bcrypt password hashes, signed HttpOnly session cookies, persisted scan history, and middleware-protected account pages.
- **Security:** Zod validation, text sanitization, bounded fields, basic in-memory rate-limit adapter, generic server errors, privacy notice, and image allow-list/size configuration.

## Quick start

Requires Node.js 20+.

```bash
cp .env.example .env
npm install
# For persistent accounts/data:
docker compose up -d db
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

For deployment environments with PostgreSQL, apply committed migrations with:

```bash
npm run db:migrate
```

Open http://localhost:3000. Public/demo pages work without paid provider credentials. PostgreSQL is required for durable accounts and scan history. With `DEMO_MODE=true`, a database write failure falls back to the transient in-memory store; production mode returns a safe unavailable response rather than pretending the scan was saved.

### Installation troubleshooting

The project uses the public npm registry and does not include a repository-level registry or proxy override. If `npm install` returns `E403`, first confirm that `npm config get registry` reports `https://registry.npmjs.org/`, then verify that your network or CI egress policy permits HTTPS access to that host. A proxy-level `CONNECT ... 403 Forbidden` occurs before npm can download package metadata and cannot be corrected by changing application source or dependency versions.

## Commands

```bash
npm run dev        # development server
npm test           # unit/service tests
npm run lint       # Next.js lint
npm run build      # production build
npm run db:generate
npm run db:push    # local schema sync
npm run db:migrate # deploy committed migrations
npm run db:seed    # database demonstration scans
```

## Environment variables

Copy `.env.example`. `DATABASE_URL` and a unique 32+ character `AUTH_SECRET` are needed for persistent accounts/history. `NEXT_PUBLIC_APP_URL` configures the app origin. `DEMO_MODE=true` keeps safe local fallbacks active. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `REVERSE_IMAGE_API_KEY` are optional integration hooks. AI and secret Stripe keys must never use a `NEXT_PUBLIC_` prefix.

### Live property data

The property service supports RentCast behind the existing provider abstraction. To enable live public-record lookups, set:

```bash
PROPERTY_PROVIDER="rentcast"
RENTCAST_API_KEY="your-server-side-key"
```

The key is used only in server-side requests through the `X-Api-Key` header. Without both settings, RentalVerify AI uses the demo property provider. Live responses are normalized into address validation, ownership, parcel/APN, property-characteristic, and sale-history checks. Missing fields and provider failures become `Unavailable` checks rather than crashing the scan.

## Persistent scan history and privacy

Completed scans are persisted through Prisma/PostgreSQL and can be reopened from authenticated dashboard/history pages after server restarts. Authenticated scans are associated with the signed-in user; anonymous scans remain unowned. Persisted lookup rules allow access only to anonymous scans or scans owned by the current authenticated user.

Conversation text is not retained for an ordinary scan. It is stored only when the user explicitly opts to save a report (`saveReport=true`). Report snapshots follow the same opt-in rule. This keeps pasted conversation content transient by default while still allowing a user-requested saved investigation record.

## Demo behavior

Demo providers perform basic address validation, seeded ZIP-prefix rent estimates, deterministic text analysis, contact consistency checks, and a small duplicate-listing simulation. Ownership, licensing, live public duplicate search, and charging are explicitly marked unavailable where no provider is configured. OCR and reverse-image checks use deterministic demo adapters when live provider credentials are incomplete.

## Next integrations and limitations

Validate RentCast coverage for target markets and add a second property-data provider before production reliance. Then prioritize live rent-comparable data, corporation/license registries, and a duplicate-listing search partner. Add Redis-backed distributed rate limiting and secure object storage before production uploads. Complete Stripe Checkout/webhooks only after credentials and product IDs are configured. Add email verification, password reset, CSRF hardening, report retention controls, audit logging, and end-to-end/browser tests before production launch.

## OCR and reverse-image verification

Image uploads use multipart form data and are validated on both client and server. Each scan accepts at most five JPEG, PNG, or WebP files of up to 5 MB each. Files are processed transiently on the server and are not written to application storage. Only concise normalized checks and justified risk signals enter the existing scan record and printable report.

The provider-neutral image service extracts only rental-useful OCR evidence: addresses, contact names, phone numbers, email addresses, advertised prices, and payment-pressure wording. Reverse-image responses are normalized to bounded HTTPS/HTTP match references. OCR text and possible matches are investigative leads: neither an OCR finding nor an image match alone proves fraud, and a search returning no matches does not verify a listing.

`DEMO_MODE=true`, or incomplete live credentials, selects deterministic demo adapters. For live adapters, configure all three values for the relevant service (`*_PROVIDER`, `*_API_URL`, and `*_API_KEY`). The generic adapters send the image as a server-side multipart `image` field with the key in an `Authorization: Bearer` header and accept normalized JSON (`text`/`fullText`/`extractedText` for OCR; `matches` for reverse image). Provider errors and the bounded `IMAGE_PROVIDER_TIMEOUT_MS` become safe `Unavailable` checks rather than leaking errors or failing the scan. Provider keys must never use a `NEXT_PUBLIC_` prefix.

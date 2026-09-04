# RentalVerify AI

A runnable MVP for explainable rental-listing risk assessment. It combines deterministic listing and communication rules, provider-neutral verification services, a transparent weighted score, printable investigation reports, authenticated dashboard/history routes, and seeded demo scenarios. Results use risk language and never claim that a listing is fraudulent based on warning signs alone.

## Architecture

- **Next.js App Router + TypeScript + Tailwind:** responsive public pages, analysis workflow, results, dashboard, history, account, and print/PDF-ready report.
- **Server routes:** validated scan creation and authentication; secrets and provider calls stay server-side.
- **Services:** provider-neutral adapters under `services/property`, `listing`, `contact`, `images`, `ai`, `rent`, `duplicates`, `payments`, `reports`, `scans`, and `scoring`.
- **Scoring:** deterministic deductions and classification thresholds live in `services/scoring/config.ts`; each signal includes evidence and an explanation.
- **Data/auth:** PostgreSQL models through Prisma, bcrypt password hashes, signed HttpOnly session cookies, persisted scan history, and middleware-protected account pages.
- **Security:** Zod validation, text sanitization, bounded fields, same-origin enforcement for unsafe browser API requests, basic in-memory rate-limit adapter, generic server errors, privacy notice, and image allow-list/size configuration.

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

For deployment environments with PostgreSQL, validate production configuration
and apply committed migrations with the migration-only command:

```bash
npm run deploy:migrate
```

This runs `prisma migrate deploy`; it never creates a migration, resets data, or
uses `prisma db push` against production.

Open http://localhost:3000. Public/demo pages work without paid provider credentials. PostgreSQL is required for durable accounts and scan history. With `DEMO_MODE=true`, a database write failure falls back to the transient in-memory store; production mode returns a safe unavailable response rather than pretending the scan was saved.

### Installation troubleshooting

The project uses the public npm registry and does not include a repository-level registry or proxy override. If `npm install` returns `E403`, first confirm that `npm config get registry` reports `https://registry.npmjs.org/`, then verify that your network or CI egress policy permits HTTPS access to that host. A proxy-level `CONNECT ... 403 Forbidden` occurs before npm can download package metadata and cannot be corrected by changing application source or dependency versions.

## Commands

```bash
npm run dev        # development server
npm test           # unit/service tests
npm run test:e2e   # critical Chromium journey (requires test PostgreSQL)
npm run lint       # Next.js lint
npm run build      # production build
npm run db:generate
npm run db:push    # local schema sync
npm run db:migrate # deploy committed migrations
npm run deploy:check   # validate required production configuration
npm run deploy:migrate # validate, then safely apply committed migrations
npm run db:seed    # database demonstration scans
```

## Environment variables

Copy `.env.example`. Production requires a pooled `DATABASE_URL`, a direct
`DIRECT_URL`, a unique 32+ character `AUTH_SECRET`, and an HTTPS
`NEXT_PUBLIC_APP_URL`. The validation command reports variable names and
requirements only; it never prints their values. `DEMO_MODE=true` keeps safe
local fallbacks active. Provider variables are optional integration hooks and
are not read as build prerequisites. API keys must never use a `NEXT_PUBLIC_`
prefix.

### Stripe payments

Paid checkout is optional. Free usage and builds continue to work when Stripe is
absent. Start with two Stripe **test mode** Prices (one-time USD
$4.99 and recurring monthly USD $9.99), then set the server-side
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_REPORT_PRICE_ID`, and
`STRIPE_PRO_PRICE_ID`. Test mode is the default and accepts only an `sk_test_`
key. No publishable key is needed because Checkout Sessions are server-created.

Forward signed test events locally with:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the CLI signing secret as `STRIPE_WEBHOOK_SECRET`. Hosted test deployments
should register `/api/stripe/webhook` for `checkout.session.completed`,
`checkout.session.async_payment_succeeded`, and
`customer.subscription.created`, `.updated`, and `.deleted`. The success page
never grants access; only a verified webhook does. Unique event/provider IDs make
retries idempotent.

Live activation is deliberately fail-closed. Complete the live-payment review,
create separate live Prices and a live webhook endpoint, then replace all four
Stripe values together and set both `STRIPE_MODE=live` and
`STRIPE_LIVE_MODE_ACKNOWLEDGED=true`. A live key is rejected unless both flags
are exact. Roll back by setting the acknowledgement to `false` and redeploying;
free scans remain available. Never mix test and live webhook secrets or Price
IDs.

## Deploy to Neon and Vercel

### 1. Create and configure Neon

1. Create a Neon project and production branch in the region closest to the
   Vercel deployment. Do not reuse the local development database.
2. In **Neon Console → Connection Details**, select the application database
   and role. Copy both connection strings:
   - the **pooled** string (hostname contains `-pooler`) becomes
     `DATABASE_URL`; append `sslmode=require` if it is not already present;
   - the **direct** string (hostname does not contain `-pooler`) becomes
     `DIRECT_URL`; retain `sslmode=require`.
3. Keep both strings server-side. The Prisma datasource uses the pooled URL for
   Vercel runtime traffic and the direct URL only for Prisma migration work.
4. From a trusted workstation or a single CI migration job, export the four
   required production variables and run `npm ci`, `npm run db:generate`, then
   `npm run deploy:migrate`. Run migrations once per release, before promoting
   the Vercel deployment; do not put migrations in a serverless request or run
   `prisma db push` against production.

### 2. Configure Vercel

1. Import this repository into Vercel as a **Next.js** project. Keep the default
   install command (`npm install`/`npm ci`) and build command (`npm run build`).
   Do not replace the build command with the migration command, because parallel
   preview/production builds must not race on schema changes.
2. Under **Project Settings → Environment Variables**, add these for
   **Production** (and use a separate Neon branch and values for Preview):
   - `DATABASE_URL`: Neon pooled connection string (secret);
   - `DIRECT_URL`: Neon direct connection string (secret);
   - `AUTH_SECRET`: unique random value of at least 32 characters (secret;
     generate with `openssl rand -base64 48` and do not rotate casually because
     rotation signs users out);
   - `NEXT_PUBLIC_APP_URL`: the canonical HTTPS Vercel/custom-domain origin;
   - `DEMO_MODE=false` for durable public behavior.
3. Add optional providers only when intentionally enabling them. Stripe remains
   disabled unless its complete documented mode-specific configuration is
   present and kept server-side. RentCast needs
   both `PROPERTY_PROVIDER=rentcast` and `RENTCAST_API_KEY`. Live OCR and reverse
   image integrations each need their complete `*_PROVIDER`, `*_API_URL`, and
   `*_API_KEY` set. Missing/incomplete optional provider settings retain the
   existing safe demo/unavailable fallback and do not fail `next build`.
4. Deploy a preview first, run the migration command against its separate Neon
   branch if it contains schema changes, and exercise signup, login, scan,
   scoring, OCR fallback, history, and report access. Then promote the same
   commit to Production after the production migration succeeds.
5. Verify `GET https://<deployment>/api/health` returns HTTP 200 with
   `{"status":"ok","configuration":"valid"}`. It is an uncached liveness and
   configuration check: it intentionally performs no database/provider call and
   exposes no connection strings, provider state, or secret values. A production
   configuration error returns HTTP 503.
6. Verify `GET https://<deployment>/api/ready` returns HTTP 200 with
   `{"status":"ready"}`. This uncached readiness probe performs a bounded
   database query and returns HTTP 503 with `{"status":"not_ready"}` when Neon
   is unavailable. It never includes connection details or raw errors.

### Deployment safety and rollback

- Keep `.env*` files and Vercel/Neon credentials out of Git and logs. Give the
  application role only the database permissions it needs, restrict Neon access
  and team membership, and rotate a credential immediately if it is exposed.
- Review committed SQL before `npm run deploy:migrate`. Prisma migrations should
  be backward-compatible for rolling Vercel deployments. Back up or branch Neon
  before destructive changes; application rollback means redeploying the prior
  Vercel commit, while database rollback requires a separately reviewed forward
  migration or Neon restore—not `migrate reset`.
- Use `/api/health` for process/configuration liveness and `/api/ready` for the
  database-backed readiness signal. Continue to verify an authenticated
  persistence flow after deployment.
- Vercel instances do not share the in-memory rate limiter. Before high-volume
  public traffic, replace it with a distributed store and add the account and
  retention hardening listed below; these are known operational follow-ups, not
  changes hidden in this deployment preparation.

### Live property data

The property service supports RentCast behind the existing provider abstraction. To enable live public-record lookups, set:

```bash
PROPERTY_PROVIDER="rentcast"
RENTCAST_API_KEY="your-server-side-key"
```

The key is used only in server-side requests through the `X-Api-Key` header. Without both settings, RentalVerify AI uses the demo property provider. Live responses are normalized into address validation, ownership, parcel/APN, property-characteristic, and sale-history checks. Missing fields and provider failures become `Unavailable` checks rather than crashing the scan.

Live RentCast property and rent calls emit privacy-safe structured reliability events to server logs. The events distinguish success, HTTP failure, invalid response, timeout, and network failure while excluding addresses, URLs, credentials, response bodies, and raw errors.

Security-sensitive account and Stripe webhook paths emit bounded structured audit events. These events record only the action, outcome, timestamp, optional internal user ID, and verified Stripe event type; they exclude credentials and submitted personal data. Production operations should export them to a durable, access-controlled log destination.

All application routes send baseline browser security headers for clickjacking, MIME sniffing, referrer, sensitive browser-feature, and HTTPS downgrade protection. A nonce-based Content Security Policy is intentionally deferred until the application and all external integrations can be exercised under it.

## Persistent scan history and privacy

Completed scans are persisted through Prisma/PostgreSQL and can be reopened from authenticated dashboard/history pages after server restarts. Authenticated scans are associated with the signed-in user; anonymous scans remain unowned. Persisted lookup rules allow access only to anonymous scans or scans owned by the current authenticated user.

Conversation text is not retained for an ordinary scan. It is stored only when the user explicitly opts to save a report (`saveReport=true`). Report snapshots follow the same opt-in rule. This keeps pasted conversation content transient by default while still allowing a user-requested saved investigation record.

Authenticated users can permanently delete any investigation they own from the dashboard or history page. Deletion removes the scan and all related property, listing, contact, signal, verification, conversation, image-metadata, and report records through database cascades. The API deliberately returns the same not-found response for missing records and records owned by another user.

The account page also provides an authenticated bulk deletion control that removes every saved investigation owned by that account while preserving the account and subscription records.

## Demo behavior

Demo providers perform basic address validation, seeded ZIP-prefix rent estimates, deterministic text analysis, contact consistency checks, and a small duplicate-listing simulation. Ownership, licensing, live public duplicate search, and charging are explicitly marked unavailable where no provider is configured. OCR and reverse-image checks use deterministic demo adapters when live provider credentials are incomplete.

## Next integrations and limitations

Validate RentCast coverage for target markets and add a second property-data provider before production reliance. Then prioritize corporation/license registries and a duplicate-listing search partner. Add Redis-backed distributed rate limiting and secure object storage before production uploads. Keep Stripe in test mode until the external live products, webhook, tax/refund policy, and controlled production smoke test are ready. Add automatic report-retention controls and durable audit-log export before high-volume launch.

## OCR and reverse-image verification

Image uploads use multipart form data and are validated on both client and server. Each scan accepts at most five JPEG, PNG, or WebP files of up to 5 MB each. Files are processed transiently on the server and are not written to application storage. Only concise normalized checks and justified risk signals enter the existing scan record and printable report.

The provider-neutral image service extracts only rental-useful OCR evidence: addresses, contact names, phone numbers, email addresses, advertised prices, and payment-pressure wording. Reverse-image responses are normalized to bounded HTTPS/HTTP match references. OCR text and possible matches are investigative leads: neither an OCR finding nor an image match alone proves fraud, and a search returning no matches does not verify a listing.

`DEMO_MODE=true`, or incomplete live credentials, selects deterministic demo adapters. For live adapters, configure all three values for the relevant service (`*_PROVIDER`, `*_API_URL`, and `*_API_KEY`). The generic adapters send the image as a server-side multipart `image` field with the key in an `Authorization: Bearer` header and accept normalized JSON (`text`/`fullText`/`extractedText` for OCR; `matches` for reverse image). Provider errors and the bounded `IMAGE_PROVIDER_TIMEOUT_MS` become safe `Unavailable` checks rather than leaking errors or failing the scan. Provider keys must never use a `NEXT_PUBLIC_` prefix.

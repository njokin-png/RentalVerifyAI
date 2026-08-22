# RentalVerify AI

A runnable MVP for explainable rental-listing risk assessment. It combines deterministic listing and communication rules, demo property/contact/rent/duplicate providers, a transparent weighted score, printable investigation reports, authenticated dashboard routes, and five seeded scenarios. Results use risk language and never claim that a listing is fraudulent based on warning signs alone.

## Architecture

- **Next.js App Router + TypeScript + Tailwind:** responsive public pages, analysis workflow, results, dashboard, history, account, and print/PDF-ready report.
- **Server routes:** validated scan creation and authentication; secrets and provider calls stay server-side.
- **Services:** provider-neutral adapters under `services/property`, `listing`, `contact`, `images`, `ai`, `rent`, `duplicates`, `payments`, `reports`, and `scoring`.
- **Scoring:** deterministic deductions and classification thresholds live in `services/scoring/config.ts`; each signal includes evidence and an explanation.
- **Data/auth:** PostgreSQL models through Prisma, bcrypt password hashes, signed HttpOnly session cookies, and middleware-protected account pages.
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

Open http://localhost:3000. The public analyzer and five demo reports work without paid provider credentials. PostgreSQL is required for signup/login persistence. If Docker/PostgreSQL is not available, leave demo mode enabled and use public/demo pages; database-backed authentication will report a safe unavailable error.

### Installation troubleshooting

The project uses the public npm registry and does not include a repository-level
registry or proxy override. If `npm install` returns `E403`, first confirm that
`npm config get registry` reports `https://registry.npmjs.org/`, then verify that
your network or CI egress policy permits HTTPS access to that host. A proxy-level
`CONNECT ... 403 Forbidden` occurs before npm can download package metadata and
cannot be corrected by changing application source or dependency versions.

After restoring registry access, run `npm install` once to create
`package-lock.json`, commit that generated lockfile, and use `npm ci` for
repeatable CI and deployment installs.

## Commands

```bash
npm run dev       # development server
npm test          # unit/service tests
npm run lint      # Next.js lint
npm run build     # production build
npm run db:seed   # five database demonstration scans
```

## Environment variables

Copy `.env.example`. `DATABASE_URL` and a unique 32+ character `AUTH_SECRET` are needed for persistent accounts. `NEXT_PUBLIC_APP_URL` configures the app origin. `DEMO_MODE=true` keeps mock integrations active. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `PROPERTY_API_KEY`, and `REVERSE_IMAGE_API_KEY` are optional integration hooks. AI and secret Stripe keys must never use a `NEXT_PUBLIC_` prefix.

## Demo behavior

Demo providers perform basic address validation, seeded ZIP-prefix rent estimates, deterministic text analysis, contact consistency checks, and a small duplicate-listing simulation. Ownership, tax, parcel/APN, licensing, live public duplicate search, OCR, reverse-image search, and charging are explicitly marked unavailable where no provider is configured. Uploaded file selection is represented in the UI, but binary persistence/OCR is disabled until secure object storage and an image provider are configured.

Five seeded report scenarios cover: very low risk, payment before touring, owner/contact mismatch, dramatically below-market rent, and a possibly copied listing. They intentionally produce different scores.

## Next integrations and limitations

Prioritize a county/property-data aggregator for ownership and parcel records, then an OCR/reverse-image provider, rent-comparable data, corporation/license registries, and a duplicate-listing search partner. Add Redis-backed distributed rate limiting and object storage with malware scanning before production uploads. Complete Stripe Checkout/webhooks only after credentials and product IDs are configured. Add email verification, password reset, CSRF hardening for expanded mutations, report retention controls, audit logging, and end-to-end/browser tests before production launch.

The in-memory scan result store is suitable only for local MVP use and resets when the server restarts. Persistent scan writes can be connected to the included relational schema without changing analysis providers.

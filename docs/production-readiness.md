# Production readiness protocol

RentalVerifyAI is in production-hardening, not feature-expansion, mode. Changes in this phase should preserve current scoring, authentication, payment entitlements, OCR/reverse-image behavior, and provider fallbacks unless a dedicated issue explicitly changes them.

## Automated gate on every pull request

GitHub Actions CI must complete these checks before merge:

1. `npm ci`
2. `npm run db:generate`
3. `npm run lint`
4. `npm test`
5. `npm run build`

Vercel preview deployment is an additional deployment signal, not a replacement for repository CI.

## Release sequence

1. Review the pull-request diff and any committed Prisma migration SQL.
2. Require green repository CI and a successful Vercel preview.
3. For releases with schema changes, run `npm run deploy:migrate` once from a trusted environment against the intended Neon database before promotion. Never run `prisma db push` against production.
4. Confirm production environment configuration without exposing secret values.
5. Verify `/api/health` returns HTTP 200 and `{ "status": "ok", "configuration": "valid" }`.
6. Run an authenticated persistence smoke test: signup, verification, login, scan, saved history/report access.
7. Exercise Stripe only in test mode until a separate live-payments security review is complete.
8. Promote the verified commit; do not rebuild unrelated changes into the release.

## Manual configuration still required

Repository code cannot safely supply deployment secrets. Before public launch, confirm in the deployment environment:

- Neon pooled `DATABASE_URL` and direct `DIRECT_URL` are separate and correct.
- `AUTH_SECRET` is unique and at least 32 characters.
- `NEXT_PUBLIC_APP_URL` is the canonical HTTPS origin.
- `DEMO_MODE=false` for durable public behavior.
- Email delivery has complete server-side `EMAIL_PROVIDER`, `EMAIL_API_URL`, `EMAIL_API_KEY`, and `EMAIL_FROM` configuration before relying on verification/reset email delivery.
- Stripe remains test-mode-only until a dedicated live-payments review.

## Browser request origin protection

All unsafe browser-facing `/api/*` requests are rejected unless their `Origin`
header exactly matches the origin of the URL being requested. This covers both
the canonical production domain and isolated Vercel preview domains. Safe
`GET`, `HEAD`, and `OPTIONS` requests remain available without an origin header.

The Stripe webhook is intentionally exempt from browser-origin enforcement
because it is a server-to-server callback authenticated by Stripe's signature
over the raw request body. Do not exempt unsigned browser endpoints.

## Session revocation

Signed session tokens carry the user's current session version. Authenticated
data access compares that signed value with the database, and fails closed when
it cannot be validated. A successful password reset increments the database
version atomically with the password change and clears the current browser
cookie, invalidating every previously issued session. The migration that adds
the version also causes legacy unversioned tokens to be rejected once.

## Known hardening follow-ups

Track these as separate, reviewable issues rather than bundling them into deployment fixes:

- distributed rate limiting for multi-instance deployments;
- audit logging for security-sensitive account/payment events;
- a documented automatic expiration schedule for old saved reports;
- end-to-end browser coverage of the critical user journey;
- email deliverability/domain verification and abuse controls;
- external alerting and dashboards for live-provider reliability telemetry.

## Live-provider reliability telemetry

RentCast property and rent requests emit one structured `provider_call` event
with the provider, operation, outcome, duration, and HTTP status when available.
Timeouts, network failures, HTTP failures, malformed responses, and successes
are distinguishable. Events intentionally exclude request URLs, addresses,
credentials, response bodies, and raw error messages. Configure alerts from
these events in the deployment platform before depending on a live provider at
high volume.

## Merge rule

Do not merge a production-hardening pull request only because it deploys. Merge after code review plus green lint, tests, build, and relevant deployment checks.

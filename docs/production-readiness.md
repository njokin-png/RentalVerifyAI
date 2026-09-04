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
6. Verify `/api/ready` returns HTTP 200 and `{ "status": "ready" }`. A 503 means the application cannot currently reach Neon and must block promotion.
7. Run an authenticated persistence smoke test: signup, verification, login, scan, saved history/report access.
8. Exercise Stripe in test mode; enable live mode only after the controlled activation checklist below is complete.
9. Promote the verified commit; do not rebuild unrelated changes into the release.

`/api/health` checks process configuration without contacting dependencies.
`/api/ready` performs a bounded database query. Both responses are uncached and
intentionally omit connection details and raw errors.

## Manual configuration still required

Repository code cannot safely supply deployment secrets. Before public launch, confirm in the deployment environment:

- Neon pooled `DATABASE_URL` and direct `DIRECT_URL` are separate and correct.
- `AUTH_SECRET` is unique and at least 32 characters.
- `NEXT_PUBLIC_APP_URL` is the canonical HTTPS origin.
- `DEMO_MODE=false` for durable public behavior.
- Email delivery has complete server-side `EMAIL_PROVIDER`, `EMAIL_API_URL`, `EMAIL_API_KEY`, and `EMAIL_FROM` configuration before relying on verification/reset email delivery.
- Stripe stays in test mode until the external live-mode checklist is complete.

## Stripe controlled activation

The application defaults to test mode and rejects live secret keys. Before live
activation, verify the $4.99 one-time Report Price and $9.99 recurring Pro Price
in Stripe, create a separate live webhook endpoint, subscribe it to the documented
checkout and subscription events, confirm the refund/cancellation and tax policy,
and run a final test-mode purchase and cancellation.

Only then replace the secret key, webhook secret, and both Price IDs together;
set `STRIPE_MODE=live` and `STRIPE_LIVE_MODE_ACKNOWLEDGED=true`; redeploy; and run
one controlled low-value production purchase. Confirm the signed webhook creates
the correct entitlement before expanding access. Setting the acknowledgement
back to `false` disables checkout on the next deployment without affecting free
scans.

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
- durable export and alerting for structured security audit events;
- a documented automatic expiration schedule for old saved reports;
- expanded cross-browser and mobile coverage beyond the Chromium critical journey;
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

## Security audit events

Authentication, password-reset, email-verification, and Stripe webhook paths
emit structured `security_audit` events with a bounded action and outcome.
Successful account events may include the internal user ID, and verified Stripe
events may include the signed event type. Audit records exclude passwords,
emails, tokens, cookies, IP addresses, credentials, and request/provider bodies.
Configure durable log export, access controls, retention, and alerts before
launch; deployment logs alone are not a permanent audit store.

## Browser security headers

Every route sends a conservative browser-security baseline: MIME sniffing is
disabled, framing is denied, referrer detail is limited across origins, camera,
microphone, and geolocation access are disabled, and HTTPS is remembered for one
year. A full Content Security Policy remains a separate change because Next.js
script nonces and every external integration must be validated before enforcing
one in production.

## Critical browser journey

CI runs a Chromium journey against a disposable PostgreSQL service. It covers
account creation, the post-signup verification notice, login, authenticated
rental analysis, saved-history access, reopening a result, and permanent
investigation deletion. The test never uses production data or credentials.

## Merge rule

Do not merge a production-hardening pull request only because it deploys. Merge after code review plus green lint, tests, build, and relevant deployment checks.

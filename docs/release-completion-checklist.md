# RentalVerifyAI completion checklist

## Completed before this release

- Android startup uses an in-app WebView and does not require AR services.
- Android Back navigation and visible Back control: confirmed working by the owner.
- URL-first listing intake, manual fallback, server-side input/image validation.
- Account recovery, scan history/deletion, signed Stripe webhooks and report entitlements.

## Current implementation

- Preserve scan/report and checkout return destinations through sign-in and signup.
- Confirm checkout ownership, Stripe payment state, and webhook-granted access before linking to a purchased report.
- Handle pending confirmation and network errors without prompting a second payment.
- Require an account for a live scan so scan ownership, monthly limits, and purchases agree.
- Validate selected photos before upload and show selection feedback.
- Mark missing live providers unavailable; never substitute simulated property/image/duplicate findings for live checks.
- Label demo assessments/reports and explain score direction and uncertainty.
- Describe actual Free/Report/Pro behavior, including shared check availability.
- Explain saved findings versus opt-in full conversation retention.

## Required verification before declaring the release complete

- [ ] Required GitHub checks and production deployment pass.
- [ ] Real phone: select a photo, complete a scan, reopen the result.
- [ ] Real phone/browser: report checkout return, paid report access and cancellation path.
- [ ] Pro activation, subscription management/cancellation, failed checkout.
- [ ] Live provider coverage confirmed from an actual scan; record unavailable checks.
- [ ] Working support/refund contact confirmed by owner; publish only an authorized contact.
- [ ] Stable private signing key provisioned for future APK updates. Current test builds use fresh debug signing and can conflict with older installs.

No APK change is needed for website changes: the installed WebView app loads the production website. Phone testing and live Stripe confirmation cannot be inferred from mocked tests.

## Low-cost marketing test after readiness

Start with renters actively assessing a specific listing before a deposit. Share one educational post in permitted renter communities and reuse the existing reel on one owned account. No advertising spend is authorized by this checklist. Track source, visits, scan starts/completions, purchase attempts, independent successful purchases, and delivered reports. Founder test transactions do not establish demand. Evaluate actual scan costs and report usefulness before changing pricing or buying traffic. Organic search content is a longer-term parallel effort; low traffic is inconclusive.

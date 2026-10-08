# RentalVerify AI Android package

This module opens the production website in an in-app WebView. It does not depend on a browser launcher or Google Play Services for AR.

## Current identifiers

- Application ID: `com.nkonenterprises.rentalverifyai`
- Website origin: `https://rentalverifyai.vercel.app`
- Launch URL: `/analyze?source=android-app`
- Minimum Android: API 23
- Target Android: API 36
- Version: 1.0.4 (code 5)

## Back navigation

Android 13 and newer use the platform Back callback; older devices use the legacy handler.
Both return to the previous page, regardless of sign-in status. The app also displays a visible
in-app Back control whenever the current page is not the home page. With no history, Back returns
from an entry page to the home page, clearing that fallback history to prevent a loop. On the home
page, the first device Back press asks for confirmation; press Back a second time within two
seconds to close the app.

Test on a phone while signed out and signed in: launch, Back to home, Back to exit; reopen,
visit Pricing and Log in, then go back through both pages. Photo selection and checkout still
need device testing. These navigation checks do not consume scans.

## Local build

Install JDK 17, Android SDK 36, Build Tools 35.0.0, and Gradle 8.13, then run:

```bash
gradle -p android :app:testDebugUnitTest :app:assembleDebug :app:bundleRelease
```

The debug APK is written below `android/app/build/outputs/apk/debug/`. The unsigned release bundle is written below `android/app/build/outputs/bundle/release/`.

## Digital Asset Links

Before device testing in full-screen trusted mode, set the website environment variable
`ANDROID_SHA256_CERT_FINGERPRINTS` to the SHA-256 fingerprint of the signing certificate.
Use comma-separated fingerprints when both upload and Play App Signing certificates need to
be trusted. The public endpoint is `/.well-known/assetlinks.json`.

Do not commit a production keystore or its passwords.

# RentalVerify AI Android package

This module packages the production website as a Trusted Web Activity (TWA), not a bare WebView.

## Current identifiers

- Application ID: `com.nkonenterprises.rentalverifyai`
- Website origin: `https://rentalverifyai.vercel.app`
- Launch URL: `/analyze?source=android-app`
- Minimum Android: API 23
- Target Android: API 36

## Local build

Install JDK 17, Android SDK 36, Build Tools 35.0.0, and Gradle 8.13, then run:

```bash
gradle -p android :app:assembleDebug :app:bundleRelease
```

The debug APK is written below `android/app/build/outputs/apk/debug/`. The unsigned release bundle is written below `android/app/build/outputs/bundle/release/`.

## Digital Asset Links

Before device testing in full-screen trusted mode, set the website environment variable
`ANDROID_SHA256_CERT_FINGERPRINTS` to the SHA-256 fingerprint of the signing certificate.
Use comma-separated fingerprints when both upload and Play App Signing certificates need to
be trusted. The public endpoint is `/.well-known/assetlinks.json`.

Do not commit a production keystore or its passwords.

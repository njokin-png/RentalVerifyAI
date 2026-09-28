import { describe, expect, it } from "vitest";
import {
  ANDROID_PACKAGE_NAME,
  createAndroidAssetLinks,
  parseAndroidFingerprints,
} from "@/lib/android-asset-links";

const VALID_FINGERPRINT = Array.from(
  { length: 32 },
  (_, index) => index.toString(16).padStart(2, "0"),
)
  .join(":")
  .toUpperCase();

describe("Android Digital Asset Links", () => {
  it("publishes the package and valid signing fingerprints", () => {
    expect(createAndroidAssetLinks(VALID_FINGERPRINT)).toEqual([
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: ANDROID_PACKAGE_NAME,
          sha256_cert_fingerprints: [VALID_FINGERPRINT],
        },
      },
    ]);
  });

  it("normalizes, deduplicates, and rejects malformed fingerprints", () => {
    expect(
      parseAndroidFingerprints(
        ` ${VALID_FINGERPRINT.toLowerCase()},bad,${VALID_FINGERPRINT} `,
      ),
    ).toEqual([VALID_FINGERPRINT]);
  });

  it("publishes no trust statement before a signing key is configured", () => {
    expect(createAndroidAssetLinks(undefined)).toEqual([]);
  });
});

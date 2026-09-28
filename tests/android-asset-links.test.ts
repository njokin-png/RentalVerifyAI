import { describe, expect, it } from "vitest";
import {
  ANDROID_DEVICE_TEST_FINGERPRINTS,
  ANDROID_PACKAGE_NAME,
  createAndroidAssetLinks,
  parseAndroidFingerprints,
} from "@/lib/android-asset-links";

const VALID_FINGERPRINT = Array.from({ length: 32 }, (_, index) =>
  index.toString(16).padStart(2, "0"),
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
          sha256_cert_fingerprints: [
            ...ANDROID_DEVICE_TEST_FINGERPRINTS,
            VALID_FINGERPRINT,
          ],
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

  it("publishes the device-test certificates before a release key is configured", () => {
    expect(createAndroidAssetLinks(undefined)).toEqual([
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: ANDROID_PACKAGE_NAME,
          sha256_cert_fingerprints: ANDROID_DEVICE_TEST_FINGERPRINTS,
        },
      },
    ]);
  });
});

export const ANDROID_PACKAGE_NAME = "com.nkonenterprises.rentalverifyai";

// Certificates used to sign the device-test APKs produced by Android builds #73 and #76.
// Keep release/Play App Signing certificates in ANDROID_SHA256_CERT_FINGERPRINTS.
export const ANDROID_DEVICE_TEST_FINGERPRINTS = [
  "C1:97:87:DA:77:DA:9F:7B:24:93:F9:7F:F2:37:F8:2E:FF:41:24:B1:97:BD:7E:07:83:57:CC:3E:26:1E:FB:A5",
  "B9:FE:62:52:B4:B4:15:36:14:B8:9C:73:D7:CA:47:70:B2:6D:89:B1:CC:78:2F:CA:27:75:04:6A:93:29:11:9C",
] as const;

const SHA256_FINGERPRINT = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

export function parseAndroidFingerprints(raw: string | undefined): string[] {
  if (!raw) return [];

  return [
    ...new Set(
      raw
        .split(",")
        .map((value) => value.trim().toUpperCase())
        .filter((value) => SHA256_FINGERPRINT.test(value)),
    ),
  ];
}

export function createAndroidAssetLinks(raw: string | undefined) {
  const fingerprints = [
    ...new Set([
      ...ANDROID_DEVICE_TEST_FINGERPRINTS,
      ...parseAndroidFingerprints(raw),
    ]),
  ];

  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: ANDROID_PACKAGE_NAME,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];
}

export const ANDROID_PACKAGE_NAME =
  "com.nkonenterprises.rentalverifyai";

const SHA256_FINGERPRINT =
  /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

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
  const fingerprints = parseAndroidFingerprints(raw);
  if (fingerprints.length === 0) return [];

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

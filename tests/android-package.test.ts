import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Android package", () => {
  const manifest = readFileSync(
    join(
      process.cwd(),
      "android",
      "app",
      "src",
      "main",
      "AndroidManifest.xml",
    ),
    "utf8",
  );
  const activity = readFileSync(
    join(
      process.cwd(),
      "android",
      "app",
      "src",
      "main",
      "java",
      "com",
      "nkonenterprises",
      "rentalverifyai",
      "MainActivity.java",
    ),
    "utf8",
  );
  const buildConfig = readFileSync(
    join(process.cwd(), "android", "app", "build.gradle.kts"),
    "utf8",
  );

  it("launches the stable in-app Android activity", () => {
    expect(manifest).toContain('android:name=".MainActivity"');
    expect(manifest).not.toContain(
      "com.google.androidbrowserhelper.trusted.LauncherActivity",
    );
    expect(buildConfig).toContain('versionName = "1.0.2"');
  });

  it("loads only the HTTPS RentalVerify host inside the app", () => {
    expect(activity).toContain(
      'private static final String APP_HOST = "rentalverifyai.vercel.app"',
    );
    expect(activity).toContain('"https".equalsIgnoreCase(uri.getScheme())');
    expect(activity).toContain("openOutsideAppIfNeeded");
  });

  it("supports listing photos and Android back navigation", () => {
    expect(activity).toContain("onShowFileChooser");
    expect(activity).toContain("webView.canGoBack()");
  });
});

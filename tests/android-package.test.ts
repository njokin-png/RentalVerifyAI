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

  it("uses Chrome instead of an incompatible manufacturer browser", () => {
    expect(manifest).toContain(
      'android:name="android.support.customtabs.trusted.LAUNCHING_BROWSER"',
    );
    expect(manifest).toContain('android:value="com.android.chrome"');
  });
});

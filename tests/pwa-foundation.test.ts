import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

describe("Android/PWA foundation", () => {
  it("launches the installed app into the rental check flow", () => {
    const appManifest = manifest();

    expect(appManifest.display).toBe("standalone");
    expect(appManifest.start_url).toBe("/analyze?source=android-app");
    expect(appManifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: "192x192", purpose: "maskable" }),
        expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
      ]),
    );
  });

  it("keeps API and authenticated navigation responses out of the cache", () => {
    const serviceWorker = readFileSync(
      join(process.cwd(), "public", "sw.js"),
      "utf8",
    );

    expect(serviceWorker).not.toContain('url.pathname.startsWith("/api/")');
    expect(serviceWorker).toContain('request.mode === "navigate"');
    expect(serviceWorker).toContain("fetch(request).catch");
    expect(serviceWorker).toContain(
      'url.pathname.startsWith("/_next/static/")',
    );
  });
});

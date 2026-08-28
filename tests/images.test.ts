import { describe, expect, it, vi } from "vitest";
import {
  DemoOcrProvider,
  DemoReverseImageProvider,
  HttpOcrProvider,
  HttpReverseImageProvider,
  mapOcrResponse,
  mapReverseImageResponse,
} from "@/services/images/adapters";
import { getImageProviders } from "@/services/images/factory";
import { analyzeImages } from "@/services/images/analyze";
import {
  imageLimits,
  validateImageFiles,
  type ImageProviders,
} from "@/services/images/provider";

const image = (name = "listing.png") =>
  new File(["not retained"], name, { type: "image/png" });

describe("image verification providers", () => {
  it("preserves server-side image count, MIME, and size validation", () => {
    expect(
      validateImageFiles([new File(["x"], "bad.gif", { type: "image/gif" })]),
    ).toContain("JPG");
    expect(
      validateImageFiles([
        new File([new Uint8Array(imageLimits.maxBytes + 1)], "large.png", {
          type: "image/png",
        }),
      ]),
    ).toContain("5 MB");
    expect(
      validateImageFiles(
        Array.from({ length: imageLimits.maxFiles + 1 }, (_, index) =>
          image(`file-${index}.png`),
        ),
      ),
    ).toContain("at most");
    expect(validateImageFiles([image()])).toBeUndefined();
  });

  it("selects credentialed live adapters only with complete server configuration", () => {
    const live = getImageProviders({
      DEMO_MODE: "false",
      OCR_PROVIDER: "ocr-vendor",
      OCR_API_URL: "https://ocr.test",
      OCR_API_KEY: "secret",
      REVERSE_IMAGE_PROVIDER: "image-vendor",
      REVERSE_IMAGE_API_URL: "https://reverse.test",
      REVERSE_IMAGE_API_KEY: "secret",
    });
    expect(live.ocr).toBeInstanceOf(HttpOcrProvider);
    expect(live.reverseImage).toBeInstanceOf(HttpReverseImageProvider);
    const fallback = getImageProviders({
      DEMO_MODE: "false",
      OCR_PROVIDER: "incomplete",
    });
    expect(fallback.ocr).toBeInstanceOf(DemoOcrProvider);
    expect(fallback.reverseImage).toBeInstanceOf(DemoReverseImageProvider);
  });

  it("maps only bounded rental-useful OCR evidence", () => {
    const result = mapOcrResponse(
      {
        text: "Contact: Alex Morgan, alex@example.com, 212-555-0147. 15 West 72nd St. Rent $1200/month. Wire the deposit immediately.",
      },
      "test",
    );
    expect(result.evidence.map((item) => item.type)).toEqual(
      expect.arrayContaining([
        "address",
        "name",
        "phone",
        "email",
        "price",
        "payment_pressure",
      ]),
    );
    expect(
      result.evidence.some((item) => item.value.includes("unrelated")),
    ).toBe(false);
  });

  it("normalizes valid reverse-image matches and discards unsafe values", () => {
    const result = mapReverseImageResponse(
      {
        matches: [
          {
            url: "https://listings.test/a",
            source: "Listing site",
            similarity: 1.4,
          },
          "javascript:alert(1)",
        ],
      },
      "test",
    );
    expect(result.matches).toEqual([
      { url: "https://listings.test/a", source: "Listing site", similarity: 1 },
    ]);
  });

  it("returns safe unavailable checks for failures and timeouts", async () => {
    vi.useFakeTimers();
    const providers: ImageProviders = {
      ocr: {
        extract: async () => {
          throw new Error("secret provider failure");
        },
      },
      reverseImage: { search: () => new Promise(() => undefined) },
    };
    const promise = analyzeImages([image()], providers, 10);
    await vi.advanceTimersByTimeAsync(11);
    const result = await promise;
    vi.useRealTimers();
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Image OCR", status: "unavailable" }),
        expect.objectContaining({
          name: "Reverse image verification",
          status: "unavailable",
        }),
      ]),
    );
    expect(JSON.stringify(result)).not.toContain("secret provider failure");
  });

  it("has deterministic demo OCR and reverse-match fallback", async () => {
    const providers = getImageProviders({ DEMO_MODE: "true" });
    const result = await analyzeImages(
      [image("pressure-known-match.png")],
      providers,
    );
    expect(result.signals).toEqual([
      expect.objectContaining({ code: "ocr-payment-pressure" }),
    ]);
    expect(
      result.checks.find((check) => check.name === "Reverse image verification")
        ?.detail,
    ).toContain("1 possible public image match");
    expect(result.checks[1].detail).toContain("does not prove fraud");
  });
});

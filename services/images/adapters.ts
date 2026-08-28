import { extractRentalEvidence } from "./evidence";
import type {
  OcrProvider,
  OcrResult,
  ReverseImageMatch,
  ReverseImageProvider,
  ReverseImageResult,
} from "./provider";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}
export function mapOcrResponse(value: unknown, provider: string): OcrResult {
  const body = record(value);
  const text =
    [body.text, body.fullText, body.extractedText].find(
      (item): item is string => typeof item === "string",
    ) ?? "";
  return {
    status: "available",
    provider,
    evidence: extractRentalEvidence(text),
  };
}
export function mapReverseImageResponse(
  value: unknown,
  provider: string,
): ReverseImageResult {
  const body = record(value);
  const raw = Array.isArray(body.matches) ? body.matches : [];
  const matches = raw
    .flatMap((item): ReverseImageMatch[] => {
      if (typeof item === "string")
        return item.startsWith("http") ? [{ url: item }] : [];
      const match = record(item);
      if (typeof match.url !== "string" || !match.url.startsWith("http"))
        return [];
      return [
        {
          url: match.url,
          source: typeof match.source === "string" ? match.source : undefined,
          similarity:
            typeof match.similarity === "number"
              ? Math.max(0, Math.min(1, match.similarity))
              : undefined,
        },
      ];
    })
    .slice(0, 10);
  return { status: "available", provider, matches };
}

abstract class HttpImageProvider {
  constructor(
    protected readonly name: string,
    protected readonly endpoint: string,
    protected readonly key: string,
  ) {}
  protected async request(file: File, signal?: AbortSignal) {
    const form = new FormData();
    form.set("image", file, file.name);
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.key}` },
      body: form,
      signal,
    });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    return response.json() as Promise<unknown>;
  }
}
export class HttpOcrProvider extends HttpImageProvider implements OcrProvider {
  async extract(file: File, signal?: AbortSignal) {
    return mapOcrResponse(await this.request(file, signal), this.name);
  }
}
export class HttpReverseImageProvider
  extends HttpImageProvider
  implements ReverseImageProvider
{
  async search(file: File, signal?: AbortSignal) {
    return mapReverseImageResponse(await this.request(file, signal), this.name);
  }
}
export class DemoOcrProvider implements OcrProvider {
  async extract(file: File): Promise<OcrResult> {
    const demoText = file.name.toLowerCase().includes("pressure")
      ? "Contact: Alex Morgan alex@example.com 212-555-0147. 15 West 72nd St. $1200/month. Wire the deposit immediately."
      : "";
    return {
      status: "available",
      provider: "demo",
      evidence: extractRentalEvidence(demoText),
    };
  }
}
export class DemoReverseImageProvider implements ReverseImageProvider {
  async search(file: File): Promise<ReverseImageResult> {
    const matches = file.name.toLowerCase().includes("known-match")
      ? [
          {
            url: "https://example.test/listings/demo-match",
            source: "Demo listing index",
            similarity: 0.94,
          },
        ]
      : [];
    return { status: "available", provider: "demo", matches };
  }
}

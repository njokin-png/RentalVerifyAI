export const imageLimits = {
  maxBytes: 5 * 1024 * 1024,
  maxFiles: 5,
  types: ["image/jpeg", "image/png", "image/webp"] as const,
};

export function validateImageFiles(files: File[]): string | undefined {
  if (files.length > imageLimits.maxFiles)
    return `Upload at most ${imageLimits.maxFiles} images.`;
  if (
    files.some(
      (file) =>
        !imageLimits.types.includes(
          file.type as (typeof imageLimits.types)[number],
        ) || file.size > imageLimits.maxBytes,
    )
  )
    return "Images must be JPG, PNG, or WebP and no larger than 5 MB each.";
  return undefined;
}

export type ImageResultStatus = "available" | "unavailable";
export type OcrEvidenceType =
  "address" | "name" | "phone" | "email" | "price" | "payment_pressure";

export type OcrEvidence = { type: OcrEvidenceType; value: string };
export type OcrResult = {
  status: ImageResultStatus;
  provider: string;
  evidence: OcrEvidence[];
  reason?: string;
};
export type ReverseImageMatch = {
  url: string;
  source?: string;
  similarity?: number;
};
export type ReverseImageResult = {
  status: ImageResultStatus;
  provider: string;
  matches: ReverseImageMatch[];
  reason?: string;
};
export interface OcrProvider {
  extract(file: File, signal?: AbortSignal): Promise<OcrResult>;
}
export interface ReverseImageProvider {
  search(file: File, signal?: AbortSignal): Promise<ReverseImageResult>;
}
export type ImageProviders = {
  ocr: OcrProvider;
  reverseImage: ReverseImageProvider;
};

export function unavailableOcr(
  provider: string,
  reason = "OCR provider unavailable.",
): OcrResult {
  return { status: "unavailable", provider, evidence: [], reason };
}
export function unavailableReverse(
  provider: string,
  reason = "Reverse-image provider unavailable.",
): ReverseImageResult {
  return { status: "unavailable", provider, matches: [], reason };
}

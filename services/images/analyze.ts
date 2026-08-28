import type { Check, RiskSignalInput } from "@/lib/types";
import { getImageProviders } from "./factory";
import {
  unavailableOcr,
  unavailableReverse,
  type ImageProviders,
  type OcrEvidence,
} from "./provider";

const labels: Record<OcrEvidence["type"], string> = {
  address: "address",
  name: "name",
  phone: "phone number",
  email: "email address",
  price: "advertised price",
  payment_pressure: "payment-pressure wording",
};
async function safely<T>(
  work: (signal: AbortSignal) => Promise<T>,
  fallback: T,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve(fallback);
    }, timeoutMs);
  });
  try {
    return await Promise.race([
      work(controller.signal).catch(() => fallback),
      timeout,
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
export async function analyzeImages(
  files: File[],
  providers: ImageProviders = getImageProviders(),
  timeoutMs = Number(process.env.IMAGE_PROVIDER_TIMEOUT_MS) || 5000,
): Promise<{ checks: Check[]; signals: RiskSignalInput[] }> {
  if (!files.length)
    return {
      checks: [
        {
          name: "Image OCR",
          status: "unavailable",
          detail: "No images were supplied, so OCR could not be performed.",
          category: "image",
        },
        {
          name: "Reverse image verification",
          status: "unavailable",
          detail:
            "No images were supplied, so reverse-image verification could not be performed.",
          category: "image",
        },
      ],
      signals: [],
    };
  const ocrResults = await Promise.all(
    files.map((file) =>
      safely(
        (signal) => providers.ocr.extract(file, signal),
        unavailableOcr(
          "configured provider",
          "OCR timed out or failed safely.",
        ),
        timeoutMs,
      ),
    ),
  );
  const reverseResults = await Promise.all(
    files.map((file) =>
      safely(
        (signal) => providers.reverseImage.search(file, signal),
        unavailableReverse(
          "configured provider",
          "Reverse-image search timed out or failed safely.",
        ),
        timeoutMs,
      ),
    ),
  );
  const evidence = ocrResults.flatMap((result) => result.evidence);
  const matches = reverseResults.flatMap((result) => result.matches);
  const ocrUnavailable = ocrResults.every(
    (result) => result.status === "unavailable",
  );
  const reverseUnavailable = reverseResults.every(
    (result) => result.status === "unavailable",
  );
  const evidenceSummary = evidence.length
    ? Array.from(
        new Set(evidence.map((item) => `${labels[item.type]}: ${item.value}`)),
      )
        .slice(0, 12)
        .join("; ")
    : "No rental-relevant text was extracted.";
  const checks: Check[] = [
    {
      name: "Image OCR",
      status: ocrUnavailable ? "unavailable" : "analyzed",
      detail: ocrUnavailable
        ? "OCR timed out, failed, or is unavailable; no conclusion was drawn."
        : `${evidenceSummary} OCR evidence alone does not prove fraud.`,
      category: "image",
    },
    {
      name: "Reverse image verification",
      status: reverseUnavailable ? "unavailable" : "analyzed",
      detail: reverseUnavailable
        ? "Reverse-image search timed out, failed, or is unavailable; no conclusion was drawn."
        : matches.length
          ? `${matches.length} possible public image match${matches.length === 1 ? "" : "es"} found: ${matches
              .slice(0, 3)
              .map((match) => match.source || new URL(match.url).hostname)
              .join(", ")}. A match alone does not prove fraud.`
          : "No matches were returned by the configured search. This does not verify the listing.",
      category: "image",
    },
  ];
  const pressure = evidence.find((item) => item.type === "payment_pressure");
  const signals: RiskSignalInput[] = pressure
    ? [
        {
          code: "ocr-payment-pressure",
          title: "Payment pressure visible in an image",
          explanation:
            "OCR found wording urging rapid payment. Verify the context and avoid irreversible payments; OCR can be inaccurate.",
          severity: "high",
          category: "payment",
          evidence: pressure.value,
          deduction: 12,
        },
      ]
    : [];
  return { checks, signals };
}

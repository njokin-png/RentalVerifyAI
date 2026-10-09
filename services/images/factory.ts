import {
  DemoOcrProvider,
  DemoReverseImageProvider,
  HttpOcrProvider,
  HttpReverseImageProvider,
} from "./adapters";
import {
  unavailableOcr,
  unavailableReverse,
  type ImageProviders,
} from "./provider";

export type ImageProviderEnv = Record<string, string | undefined>;
export function getImageProviders(
  env: ImageProviderEnv = process.env,
): ImageProviders {
  const demo = env.DEMO_MODE === "true";
  const ocr =
    !demo && env.OCR_PROVIDER && env.OCR_API_URL && env.OCR_API_KEY
      ? new HttpOcrProvider(env.OCR_PROVIDER, env.OCR_API_URL, env.OCR_API_KEY)
      : demo
        ? new DemoOcrProvider()
        : {
            extract: async () =>
              unavailableOcr(
                "none",
                "Live image text extraction is not configured.",
              ),
          };
  const reverseImage =
    !demo &&
    env.REVERSE_IMAGE_PROVIDER &&
    env.REVERSE_IMAGE_API_URL &&
    env.REVERSE_IMAGE_API_KEY
      ? new HttpReverseImageProvider(
          env.REVERSE_IMAGE_PROVIDER,
          env.REVERSE_IMAGE_API_URL,
          env.REVERSE_IMAGE_API_KEY,
        )
      : demo
        ? new DemoReverseImageProvider()
        : {
            search: async () =>
              unavailableReverse(
                "none",
                "Live reverse-image search is not configured.",
              ),
          };
  return { ocr, reverseImage };
}

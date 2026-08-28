import {
  DemoOcrProvider,
  DemoReverseImageProvider,
  HttpOcrProvider,
  HttpReverseImageProvider,
} from "./adapters";
import type { ImageProviders } from "./provider";

export type ImageProviderEnv = Record<string, string | undefined>;
export function getImageProviders(
  env: ImageProviderEnv = process.env,
): ImageProviders {
  const demo = env.DEMO_MODE === "true";
  const ocr =
    !demo && env.OCR_PROVIDER && env.OCR_API_URL && env.OCR_API_KEY
      ? new HttpOcrProvider(env.OCR_PROVIDER, env.OCR_API_URL, env.OCR_API_KEY)
      : new DemoOcrProvider();
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
      : new DemoReverseImageProvider();
  return { ocr, reverseImage };
}

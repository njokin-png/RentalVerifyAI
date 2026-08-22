export interface ImageAnalysisProvider {
  extract(file: File): Promise<{
    address?: string;
    rent?: number;
    phone?: string;
    email?: string;
    text?: string;
  }>;
}
export interface ReverseImageProvider {
  search(file: File): Promise<{ matches: string[] }>;
}
export const imageLimits = {
  maxBytes: 5 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp"],
};
export const reverseImageConfigured = () =>
  Boolean(process.env.REVERSE_IMAGE_API_KEY);

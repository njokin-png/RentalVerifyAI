import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const pages: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/analyze", changeFrequency: "monthly", priority: 0.9 },
  { path: "/safety", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  return pages.map(({ path, ...metadata }) => ({
    url: new URL(path, site).toString(),
    ...metadata,
  }));
}

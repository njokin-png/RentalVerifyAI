import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/account",
        "/dashboard",
        "/history",
        "/results/",
        "/report/",
        "/checkout/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/verify",
        "/check-email",
        "/resend-verification",
      ],
    },
    sitemap: new URL("/sitemap.xml", site).toString(),
    host: site.origin,
  };
}

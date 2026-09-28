import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RentalVerify AI",
    short_name: "RentalVerify",
    description: "Check rental scam warning signs before you send money.",
    id: "/",
    start_url: "/analyze?source=android-app",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8fbfb",
    theme_color: "#087f7b",
    categories: ["finance", "lifestyle", "utilities"],
    icons: [
      {
        src: "/icons/rentalverify-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/rentalverify-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PwaRegistration } from "@/components/PwaRegistration";
import { getSiteUrl } from "@/lib/site-url";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#087f7b",
};

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "RentalVerify AI | Rental listing risk checks",
    template: "%s | RentalVerify AI",
  },
  description: "Identify rental scam warning signs before you send money.",
  applicationName: "RentalVerify AI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RentalVerify AI",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "RentalVerify AI",
    title: "RentalVerify AI | Rental listing risk checks",
    description: "Identify rental scam warning signs before you send money.",
  },
  twitter: {
    card: "summary",
    title: "RentalVerify AI | Rental listing risk checks",
    description: "Identify rental scam warning signs before you send money.",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PwaRegistration />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

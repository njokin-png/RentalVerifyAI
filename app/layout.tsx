import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteUrl } from "@/lib/site-url";
export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "RentalVerify AI | Rental listing risk checks",
    template: "%s | RentalVerify AI",
  },
  description: "Identify rental scam warning signs before you send money.",
  applicationName: "RentalVerify AI",
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

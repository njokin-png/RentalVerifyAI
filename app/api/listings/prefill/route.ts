import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  listingUrl: z.string().url().max(2000),
});

const supportedHosts = new Set([
  "www.spareroom.com",
  "spareroom.com",
]);

function cleanText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanText(match[1]);
  }
}

function parseSpareRoom(html: string) {
  const text = cleanText(html);
  const title =
    firstMatch(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ]) || "";

  const description =
    firstMatch(html, [
      /<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i,
    ]) || "";

  const rentRaw = firstMatch(text, [
    /\$\s*([\d,]+)\s*(?:per\s*month|pcm|\/\s*month|monthly)/i,
    /rent[^$]{0,30}\$\s*([\d,]+)/i,
  ]);
  const zip = firstMatch(text, [/\b(?:CA\s+)?(\d{5})(?:-\d{4})?\b/i]);
  const location = firstMatch(text, [
    /(?:room|rooms|rental|share)[^,.]{0,40}\bin\s+([A-Za-z .'-]+,\s*CA\s+\d{5})/i,
    /\b([A-Za-z .'-]+,\s*CA\s+\d{5})\b/i,
  ]);
  const landlordName = firstMatch(text, [
    /(?:advertiser|landlord|posted by)\s*[:\-]?\s*([A-Z][A-Za-z'-]{1,40})/i,
  ]);

  return {
    address: location || "",
    zip: zip || "",
    advertisedRent: rentRaw ? Number(rentRaw.replace(/,/g, "")) : "",
    landlordName: landlordName || "",
    listingText: description || title,
  };
}

export async function POST(req: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Paste a valid rental listing URL." }, { status: 400 });
    }

    const url = new URL(parsed.data.listingUrl);
    if (url.protocol !== "https:") {
      return NextResponse.json({ error: "For your safety, the listing link must use HTTPS." }, { status: 400 });
    }

    if (!supportedHosts.has(url.hostname.toLowerCase())) {
      return NextResponse.json({
        fields: {},
        message:
          "Link saved. Automatic extraction is not available for this marketplace yet, so add the missing details below.",
      });
    }

    const response = await fetch(url.toString(), {
      redirect: "error",
      signal: AbortSignal.timeout(5000),
      headers: {
        "user-agent": "RentalVerifyAI/1.0 (+https://rentalverifyai.vercel.app)",
        accept: "text/html",
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        fields: {},
        message:
          "Link saved. This marketplace did not allow automatic reading, so add the missing details below.",
      });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json({ fields: {}, message: "Link saved. Add the missing listing details below." });
    }

    const length = Number(response.headers.get("content-length") || "0");
    if (length > 1_500_000) {
      return NextResponse.json({ fields: {}, message: "Link saved. This page is too large to read automatically; add the missing details below." });
    }

    const html = (await response.text()).slice(0, 1_500_000);
    const fields = parseSpareRoom(html);
    const found = Object.values(fields).filter((value) => value !== "").length;

    return NextResponse.json({
      fields,
      message: found
        ? `We found ${found} listing detail${found === 1 ? "" : "s"}. Review them and fill in anything missing.`
        : "Link saved. We could not reliably extract details, so add the missing information below.",
    });
  } catch {
    return NextResponse.json({
      fields: {},
      message: "Link saved. We could not read this listing automatically, so add the missing details below.",
    });
  }
}

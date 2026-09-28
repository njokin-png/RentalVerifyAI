import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/listings/prefill/route";

const endpoint = "https://rentalverifyai.test/api/listings/prefill";

function request(listingUrl: unknown) {
  return new NextRequest(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ listingUrl }),
  });
}

function htmlResponse(html: string, headers: Record<string, string> = {}) {
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", ...headers },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("listing prefill route", () => {
  it("rejects non-HTTPS listing URLs before fetching them", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      request("http://www.spareroom.com/rooms-for-rent/example"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "For your safety, the listing link must use HTTPS.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed URLs before fetching them", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request("not a listing URL"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Paste a valid rental listing URL.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps unsupported hosts on the manual-entry path without fetching", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      request("https://listings.example.com/rental/123"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.fields).toEqual({});
    expect(body.message).toContain("add the missing details below");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to manual entry when SpareRoom blocks the fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(
        async () => new Response("Forbidden", { status: 403 }),
      ),
    );

    const response = await POST(
      request("https://www.spareroom.com/rooms-for-rent/blocked"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.fields).toEqual({});
    expect(body.message).toContain("did not allow automatic reading");
  });

  it("falls back to manual entry when the upstream request rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    const response = await POST(
      request("https://spareroom.com/rooms-for-rent/unavailable"),
    );

    await expect(response.json()).resolves.toMatchObject({
      fields: {},
      message: expect.stringContaining("add the missing details below"),
    });
  });

  it("handles malformed HTML without inventing listing details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () =>
        htmlResponse("<html><head><meta property='og:title' content='</head>"),
      ),
    );

    const response = await POST(
      request("https://www.spareroom.com/rooms-for-rent/malformed"),
    );

    await expect(response.json()).resolves.toEqual({
      fields: {
        address: "",
        zip: "",
        advertisedRent: "",
        landlordName: "",
        listingText: "",
      },
      message:
        "Link saved. We could not reliably extract details, so add the missing information below.",
    });
  });

  it("extracts SpareRoom location, ZIP, rent, advertiser, and description", async () => {
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta property="og:title" content="Sunny room near Balboa Park" />
          <meta name="description" content="Furnished room with utilities included." />
        </head>
        <body>
          Room for rent in North Park, CA 92104
          $1,450 per month
          Advertiser: Jordan
        </body>
      </html>
    `;
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => htmlResponse(html)),
    );

    const response = await POST(
      request("https://www.spareroom.com/rooms-for-rent/102862152"),
    );

    await expect(response.json()).resolves.toEqual({
      fields: {
        address: "North Park, CA 92104",
        zip: "92104",
        advertisedRent: 1450,
        landlordName: "Jordan",
        listingText: "Furnished room with utilities included.",
      },
      message:
        "We found 5 listing details. Review them and fill in anything missing.",
    });
  });

  it("uses the SpareRoom title when no description is available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () =>
        htmlResponse(`
          <html>
            <head><title>Private room in Hillcrest</title></head>
            <body>Posted by: Avery</body>
          </html>
        `),
      ),
    );

    const response = await POST(
      request("https://spareroom.com/rooms-for-rent/title-only"),
    );
    const body = await response.json();

    expect(body.fields.listingText).toBe("Private room in Hillcrest");
    expect(body.fields.landlordName).toBe("Avery");
  });

  it("disables redirects and requests a five-second timeout", async () => {
    const signal = new AbortController().signal;
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout").mockReturnValue(signal);
    const fetchMock = vi.fn<typeof fetch>(async () => htmlResponse("<html />"));
    vi.stubGlobal("fetch", fetchMock);

    await POST(request("https://www.spareroom.com/rooms-for-rent/safe"));

    expect(timeoutSpy).toHaveBeenCalledWith(5_000);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://www.spareroom.com/rooms-for-rent/safe",
      expect.objectContaining({ redirect: "error", signal }),
    );
  });

  it("rejects declared HTML responses larger than 1.5 MB", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () =>
        htmlResponse("not read", { "content-length": "1500001" }),
      ),
    );

    const response = await POST(
      request("https://www.spareroom.com/rooms-for-rent/oversized"),
    );

    await expect(response.json()).resolves.toEqual({
      fields: {},
      message:
        "Link saved. This page is too large to read automatically; add the missing details below.",
    });
  });

  it("does not extract content beyond the 1.5 MB response cap", async () => {
    const html = `${"x".repeat(1_500_000)} Advertiser: HiddenAfterCap`;
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => htmlResponse(html)),
    );

    const response = await POST(
      request("https://www.spareroom.com/rooms-for-rent/truncated"),
    );
    const body = await response.json();

    expect(body.fields.landlordName).toBe("");
    expect(body.message).toContain("add the missing information below");
  });
});

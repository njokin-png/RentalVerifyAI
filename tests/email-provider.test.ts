import { afterEach, describe, expect, it, vi } from "vitest";
import { getEmailConfiguration } from "@/lib/env";
import { sendEmail } from "@/services/email";

const message = {
  to: "renter@example.com",
  subject: "Verify your account",
  text: "Open the one-time verification link.",
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("account email provider", () => {
  it("maps the two-value Resend configuration without a user-supplied API URL", () => {
    expect(
      getEmailConfiguration({
        RESEND_API_KEY: "re_server_secret",
        EMAIL_FROM: "RentalVerifyAI <account@example.com>",
      }),
    ).toEqual({
      provider: "resend",
      apiUrl: "https://api.resend.com/emails",
      apiKey: "re_server_secret",
      from: "RentalVerifyAI <account@example.com>",
    });
  });

  it("disables incomplete or malformed Resend configuration", () => {
    expect(
      getEmailConfiguration({ RESEND_API_KEY: "re_server_secret" }),
    ).toBeNull();
    expect(
      getEmailConfiguration({
        RESEND_API_KEY: "not-a-resend-key",
        EMAIL_FROM: "account@example.com",
      }),
    ).toBeNull();
  });

  it("keeps the complete generic HTTPS provider configuration", () => {
    expect(
      getEmailConfiguration({
        EMAIL_PROVIDER: "example",
        EMAIL_API_URL: "https://email.example.com/send",
        EMAIL_API_KEY: "server-secret",
        EMAIL_FROM: "account@example.com",
      }),
    ).toEqual({
      provider: "generic",
      apiUrl: "https://email.example.com/send",
      apiKey: "server-secret",
      from: "account@example.com",
    });
  });

  it("sends Resend requests without leaking provider configuration", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_server_secret");
    vi.stubEnv("EMAIL_FROM", "RentalVerifyAI <account@example.com>");
    const fetchMock = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendEmail(message)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: {
          authorization: "Bearer re_server_secret",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: "RentalVerifyAI <account@example.com>",
          to: "renter@example.com",
          subject: "Verify your account",
          text: "Open the one-time verification link.",
        }),
      }),
    );
  });

  it("returns false for missing configuration and provider failures", async () => {
    const fetchMock = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 429 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(sendEmail(message)).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();

    vi.stubEnv("RESEND_API_KEY", "re_server_secret");
    vi.stubEnv("EMAIL_FROM", "account@example.com");
    await expect(sendEmail(message)).resolves.toBe(false);
  });

  it("aborts a provider request after the bounded timeout", async () => {
    vi.useFakeTimers();
    vi.stubEnv("RESEND_API_KEY", "re_server_secret");
    vi.stubEnv("EMAIL_FROM", "account@example.com");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string | URL | Request, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      ),
    );

    const sending = sendEmail(message);
    await vi.advanceTimersByTimeAsync(8_000);
    await expect(sending).resolves.toBe(false);
  });
});

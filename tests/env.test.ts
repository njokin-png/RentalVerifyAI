import { describe, expect, it } from "vitest";
import {
  getAuthSecret,
  getStripeConfiguration,
  validateProductionEnvironment,
} from "@/lib/env";

const valid = {
  NODE_ENV: "production",
  DATABASE_URL:
    "postgresql://user:database-secret@ep-example-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
  DIRECT_URL:
    "postgresql://user:database-secret@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require",
  AUTH_SECRET: "a-unique-production-secret-that-is-long-enough",
  NEXT_PUBLIC_APP_URL: "https://rentalverify.example",
};

describe("production environment", () => {
  it("accepts Neon pooled runtime and direct migration connections", () => {
    expect(validateProductionEnvironment(valid)).toEqual({ ok: true });
  });

  it("reports names and requirements without exposing secret values", () => {
    const secret = "short-database-password";
    const result = validateProductionEnvironment({
      ...valid,
      DATABASE_URL: `postgresql://user:${secret}@ep-example.us-east-2.aws.neon.tech/neondb`,
      AUTH_SECRET: "short",
      NEXT_PUBLIC_APP_URL: "http://rentalverify.example",
    });
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain(secret);
    if (!result.ok) {
      expect(result.errors.join(" ")).toContain("pooled");
      expect(result.errors.join(" ")).toContain("AUTH_SECRET");
      expect(result.errors.join(" ")).toContain("HTTPS");
    }
  });

  it("rejects the development auth fallback in production", () => {
    expect(() => getAuthSecret({ NODE_ENV: "production" })).toThrow(
      "AUTH_SECRET is not securely configured",
    );
  });

  it("accepts only complete test-mode Stripe configuration", () => {
    const stripe = {
      STRIPE_WEBHOOK_SECRET: "whsec_x",
      STRIPE_REPORT_PRICE_ID: "price_report",
      STRIPE_PRO_PRICE_ID: "price_pro",
    };
    expect(
      getStripeConfiguration({
        ...stripe,
        STRIPE_SECRET_KEY: "sk_live_forbidden",
      }),
    ).toBeNull();
    expect(
      getStripeConfiguration({ ...stripe, STRIPE_SECRET_KEY: "sk_test_safe" }),
    ).toEqual({
      secretKey: "sk_test_safe",
      webhookSecret: "whsec_x",
      reportPriceId: "price_report",
      proPriceId: "price_pro",
    });
  });
});

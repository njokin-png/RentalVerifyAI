export type Environment = Record<string, string | undefined>;

export type ProductionEnvironmentCheck =
  | { ok: true }
  | { ok: false; errors: string[] };

export type StripeConfiguration = {
  secretKey: string;
  webhookSecret: string;
  reportPriceId: string;
  proPriceId: string;
};

export type EmailConfiguration = {
  provider: string;
  apiUrl: string;
  apiKey: string;
  from: string;
};

/** Paid features are optional, but only complete Stripe test configuration is usable. */
export function getStripeConfiguration(
  env: Environment = process.env,
): StripeConfiguration | null {
  const values = {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    reportPriceId: env.STRIPE_REPORT_PRICE_ID,
    proPriceId: env.STRIPE_PRO_PRICE_ID,
  };
  if (Object.values(values).some((value) => !value)) return null;
  if (
    !values.secretKey!.startsWith("sk_test_") ||
    !values.webhookSecret!.startsWith("whsec_")
  )
    return null;
  if (
    !values.reportPriceId!.startsWith("price_") ||
    !values.proPriceId!.startsWith("price_")
  )
    return null;
  return values as StripeConfiguration;
}

/** Email delivery is optional. Incomplete or non-HTTPS configuration disables it safely. */
export function getEmailConfiguration(
  env: Environment = process.env,
): EmailConfiguration | null {
  const provider = env.EMAIL_PROVIDER?.trim();
  const apiUrl = env.EMAIL_API_URL?.trim();
  const apiKey = env.EMAIL_API_KEY?.trim();
  const from = env.EMAIL_FROM?.trim();
  if (!provider || !apiUrl || !apiKey || !from) return null;
  try {
    const url = new URL(apiUrl);
    if (url.protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { provider, apiUrl, apiKey, from };
}

function parsePostgresUrl(name: string, value: string | undefined) {
  if (!value) return { error: `${name} is required.` };
  try {
    const url = new URL(value);
    if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
      return { error: `${name} must be a PostgreSQL connection URL.` };
    }
    return { url };
  } catch {
    return { error: `${name} must be a valid URL.` };
  }
}

/** Validates deployment configuration without returning or logging secret values. */
export function validateProductionEnvironment(
  env: Environment = process.env,
): ProductionEnvironmentCheck {
  const errors: string[] = [];
  const database = parsePostgresUrl("DATABASE_URL", env.DATABASE_URL);
  const direct = parsePostgresUrl("DIRECT_URL", env.DIRECT_URL);
  if (database.error) errors.push(database.error);
  if (direct.error) errors.push(direct.error);

  if (database.url && direct.url) {
    if (database.url.toString() === direct.url.toString()) {
      errors.push(
        "DATABASE_URL and DIRECT_URL must use separate pooled and direct connections.",
      );
    }
    const usesNeon =
      database.url.hostname.endsWith(".neon.tech") ||
      direct.url.hostname.endsWith(".neon.tech");
    if (usesNeon && !database.url.hostname.includes("-pooler.")) {
      errors.push("DATABASE_URL must use the Neon pooled hostname.");
    }
    if (usesNeon && direct.url.hostname.includes("-pooler.")) {
      errors.push("DIRECT_URL must use the Neon direct (non-pooler) hostname.");
    }
  }

  const secret = env.AUTH_SECRET;
  if (!secret || secret.length < 32 || secret.includes("replace-with")) {
    errors.push(
      "AUTH_SECRET must be a unique value of at least 32 characters.",
    );
  }

  try {
    const appUrl = new URL(env.NEXT_PUBLIC_APP_URL || "");
    if (appUrl.protocol !== "https:") {
      errors.push("NEXT_PUBLIC_APP_URL must use HTTPS in production.");
    }
  } catch {
    errors.push("NEXT_PUBLIC_APP_URL must be a valid production URL.");
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

export function getAuthSecret(env: Environment = process.env): Uint8Array {
  const value = env.AUTH_SECRET;
  if (env.NODE_ENV === "production" && (!value || value.length < 32)) {
    throw new Error("AUTH_SECRET is not securely configured.");
  }
  return new TextEncoder().encode(
    value || "development-secret-change-this-now-32",
  );
}

export type SecurityAction =
  | "login"
  | "signup"
  | "password_reset"
  | "email_verification"
  | "stripe_webhook";

export type SecurityOutcome =
  "success" | "rejected" | "rate_limited" | "duplicate" | "error";

export type SecurityAuditEvent = {
  action: SecurityAction;
  outcome: SecurityOutcome;
  actorId?: string;
  providerEventType?: string;
};

/**
 * Emit a deliberately bounded audit record. Callers cannot attach arbitrary
 * metadata, which helps keep credentials, tokens, email addresses, IPs, request
 * bodies, and provider payloads out of logs.
 */
export function recordSecurityEvent(event: SecurityAuditEvent) {
  if (process.env.NODE_ENV === "test") return;
  try {
    console.info(
      JSON.stringify({
        event: "security_audit",
        occurredAt: new Date().toISOString(),
        ...event,
      }),
    );
  } catch {
    // Audit transport must never change the protected operation's outcome.
  }
}

export type ProviderOutcome =
  "success" | "http_error" | "invalid_response" | "timeout" | "network_error";

export type ProviderEvent = {
  provider: string;
  operation: string;
  outcome: ProviderOutcome;
  durationMs: number;
  statusCode?: number;
};

export type ProviderMonitor = (event: ProviderEvent) => void;

/**
 * Emit bounded operational metadata only. Never add request URLs, addresses,
 * credentials, response bodies, or raw errors to provider events.
 */
export const recordProviderEvent: ProviderMonitor = (event) => {
  if (process.env.NODE_ENV === "test") return;
  console.info(JSON.stringify({ event: "provider_call", ...event }));
};

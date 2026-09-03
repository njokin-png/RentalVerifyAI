const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function normalizeOrigin(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Unsafe browser requests must identify the same origin as the URL they target.
 * This works for the canonical domain and Vercel preview domains without trusting
 * a separate client-supplied host header.
 */
export function isSameOriginRequest(request: Request) {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true;

  const suppliedOrigin = normalizeOrigin(request.headers.get("origin"));
  const requestOrigin = normalizeOrigin(request.url);

  return Boolean(
    suppliedOrigin && requestOrigin && suppliedOrigin === requestOrigin,
  );
}

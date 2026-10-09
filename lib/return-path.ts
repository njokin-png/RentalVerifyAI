/** Keep authentication return destinations on this application. */
export function safeReturnPath(
  value: string | undefined,
  fallback = "/dashboard",
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\x00-\x20]/.test(value)
  )
    return fallback;
  return value;
}

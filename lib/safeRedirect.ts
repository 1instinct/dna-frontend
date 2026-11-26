/**
 * A post-login redirect target that can only be a path on this site: one
 * leading "/", not "//" or "/\" (which browsers treat as another origin), no
 * control characters. Anything else becomes `fallback`.
 */
export function safeRedirect(
  raw: string | string[] | undefined | null,
  fallback = "/"
): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}

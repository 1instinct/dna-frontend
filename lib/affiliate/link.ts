/** Affiliate link building for the dashboard's link builder. */

/** The origin of the server-provided link, or `fallback`. */
export function linkOrigin(link: string | null | undefined, fallback: string) {
  if (!link) return fallback;
  try {
    return new URL(link).origin;
  } catch {
    return fallback;
  }
}

/**
 * `origin` + any page on the site + `?ref=code`. The page may be a path
 * ("browse", "/browse?sort=newest") or a pasted URL of the same site (with or
 * without the scheme). Returns null for a URL on another site.
 */
export function buildAffiliateLink(
  origin: string,
  page: string,
  code: string
): string | null {
  const base = new URL(origin);
  let input = page.trim();
  if (input.startsWith(`${base.host}`)) input = `${base.protocol}//${input}`;

  let url: URL;
  try {
    url = /^[a-z][a-z0-9+.-]*:\/\//i.test(input)
      ? new URL(input)
      : new URL(input.startsWith("/") ? input : `/${input}`, base);
  } catch {
    return null;
  }
  const sameSite =
    url.host === base.host || url.host.replace(/^www\./, "") === base.host;
  if (!sameSite) return null;

  url.searchParams.delete("ref");
  url.searchParams.append("ref", code);
  return `${base.origin}${url.pathname}${url.search}${url.hash}`;
}

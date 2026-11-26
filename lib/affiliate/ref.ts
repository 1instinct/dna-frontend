/**
 * Affiliate referral cookie (`aff_ref`).
 *
 * A `?ref=CODE` on any page stores `{ code, ts, days }` for `days` (the
 * affiliate's cookie window, 30 by default). The newest code wins. The cookie
 * is read when the code is attached to the cart (see lib/affiliate/attach).
 *
 * Pure apart from readRef/writeRef's default use of `document.cookie`.
 */

export const REF_COOKIE = "aff_ref";
export const DEFAULT_REF_DAYS = 30;
const DAY_MS = 86400000;
const CODE_RE = /^[a-z0-9-]{4,24}$/;

export interface Ref {
  code: string;
  /** When the code was captured (ms since epoch). */
  ts: number;
  /** How long it lasts, in days. */
  days: number;
}

/** Lowercases and validates an affiliate code: 4–24 of [a-z0-9-]. */
export function normalizeRefCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toLowerCase();
  return CODE_RE.test(code) ? code : null;
}

/** The valid, lowercased `ref` query parameter of a URL or path, or null. */
export function refFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url, "https://placeholder.invalid");
    return normalizeRefCode(parsed.searchParams.get("ref"));
  } catch {
    return null;
  }
}

/** The more recent of two refs (either may be null). */
export function newerRef(a: Ref | null, b: Ref | null): Ref | null {
  if (!a) return b;
  if (!b) return a;
  return b.ts > a.ts ? b : a;
}

function parseRef(value: string, now: number): Ref | null {
  try {
    const data = JSON.parse(decodeURIComponent(value));
    const code = normalizeRefCode(data?.code);
    const ts = Number(data?.ts);
    const days =
      Number.isFinite(Number(data?.days)) && Number(data?.days) > 0
        ? Number(data.days)
        : DEFAULT_REF_DAYS;
    if (!code || !Number.isFinite(ts) || ts > now) return null;
    if (now - ts > days * DAY_MS) return null;
    return { code, ts, days };
  } catch {
    return null;
  }
}

/**
 * The newest live ref in a cookie header (defaults to `document.cookie`).
 * A header can carry the name twice (say, host and parent-domain cookies);
 * expired and malformed entries are ignored.
 */
export function readRef(
  cookieHeader?: string,
  now: number = Date.now()
): Ref | null {
  const header =
    cookieHeader ??
    (typeof document !== "undefined" ? document.cookie : undefined) ??
    "";
  let best: Ref | null = null;
  for (const part of header.split(";")) {
    const pair = part.trim();
    if (!pair.startsWith(`${REF_COOKIE}=`)) continue;
    best = newerRef(best, parseRef(pair.slice(REF_COOKIE.length + 1), now));
  }
  return best;
}

/** The `document.cookie` assignment that stores a ref. */
export function refCookieString(ref: Ref, secure: boolean): string {
  const value = encodeURIComponent(JSON.stringify(ref));
  const maxAge = Math.round(ref.days * 86400);
  return `${REF_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${
    secure ? "; Secure" : ""
  }`;
}

/** Stores a code for `days`, replacing any older one. Null if invalid. */
export function writeRef(
  rawCode: string,
  days: number = DEFAULT_REF_DAYS,
  now: number = Date.now()
): Ref | null {
  const code = normalizeRefCode(rawCode);
  if (!code || typeof document === "undefined") return null;
  const ref: Ref = {
    code,
    ts: now,
    days: days > 0 ? days : DEFAULT_REF_DAYS
  };
  const secure =
    typeof window !== "undefined" && window.location?.protocol === "https:";
  document.cookie = refCookieString(ref, secure);
  return ref;
}

/** Puts back a previous ref (or clears the cookie when there was none). */
export function restoreRef(previous: Ref | null): void {
  if (typeof document === "undefined") return;
  if (previous) {
    const left = Math.max(
      1,
      (previous.ts + previous.days * DAY_MS - Date.now()) / DAY_MS
    );
    const secure =
      typeof window !== "undefined" && window.location?.protocol === "https:";
    // Keep the original capture time; only the cookie's own lifetime shrinks.
    document.cookie = refCookieString(previous, secure).replace(
      /max-age=\d+/,
      `max-age=${Math.round(left * 86400)}`
    );
  } else {
    document.cookie = `${REF_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

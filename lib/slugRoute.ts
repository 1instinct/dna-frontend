// Decides what /<slug> is: a product, nothing, or "can't tell right now".
// Plain fetch, no storage or window access (getServerSideProps and
// getStaticProps call it).
//
// Asks for GET /products/<slug>, not GET /products?filter[slug]=: Spree 4.2
// ignores that filter and returns the whole catalog, so every slug looked like
// a product.

import { isProductHidden } from "./productVisibility";

/** First path segments that are not products, so never looked up. */
export const RESERVED_SLUGS = [
  "cart",
  "checkout",
  "login",
  "signup",
  "account",
  "browse",
  "about",
  "terms",
  "privacy",
  "home",
  "reset-password",
  "thank-you",
  "update-email",
  "update-password",
  "category",
  "tag",
  "api",
  "admin",
  "tv",
  "user",
  "images",
  "fonts",
  "static",
  "assets",
  "_next"
];

// Product slugs (FriendlyId) only use these. Everything else, like
// robots.txt or wp-login.php, is not found without troubling the API.
const SLUG_SHAPE = /^[A-Za-z0-9_-]{1,255}$/;

export const isRoutableSlug = (slug: string): boolean =>
  SLUG_SHAPE.test(slug) && !RESERVED_SLUGS.includes(slug);

export const SLUG_LOOKUP_TIMEOUT_MS = 8000;

type FetchLike = (
  url: string,
  init?: { headers?: Record<string, string>; signal?: AbortSignal }
) => Promise<{ ok: boolean; status: number; json: () => Promise<any> }>;

export interface LookupOptions {
  /** The Spree URL; server-side callers only. */
  baseUrl: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}

type FetchResult =
  | { outcome: "ok"; body: any }
  | { outcome: "missing" }
  | { outcome: "error" };

async function fetchJson(
  url: string,
  headers: Record<string, string>,
  {
    fetchImpl,
    timeoutMs = SLUG_LOOKUP_TIMEOUT_MS
  }: Pick<LookupOptions, "fetchImpl" | "timeoutMs">
): Promise<FetchResult> {
  const doFetch = fetchImpl || (fetch as unknown as FetchLike);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await doFetch(url, { headers, signal: controller.signal });
    if (res.status === 404 || res.status === 410) return { outcome: "missing" };
    if (!res.ok) return { outcome: "error" };
    return { outcome: "ok", body: await res.json() };
  } catch {
    return { outcome: "error" };
  } finally {
    clearTimeout(timer);
  }
}

export type ProductLookup =
  | { status: "visible"; attributes: Record<string, any> }
  | { status: "hidden" }
  | { status: "missing" }
  | { status: "error" };

export async function lookupProduct(
  slug: string,
  { baseUrl, ...options }: LookupOptions
): Promise<ProductLookup> {
  const result = await fetchJson(
    `${baseUrl}/api/v2/storefront/products/${encodeURIComponent(slug)}`,
    { "Content-Type": "application/vnd.api+json" },
    options
  );
  if (result.outcome === "error") return { status: "error" };
  if (result.outcome === "missing") return { status: "missing" };

  const attributes = result.body?.data?.attributes;
  // The API also finds by numeric id, and /2 is not that product's page.
  if (!attributes || attributes.slug !== slug) return { status: "missing" };
  if (isProductHidden(attributes)) return { status: "hidden" };
  return { status: "visible", attributes };
}

export type SlugResolution =
  | { kind: "product" }
  | { kind: "not-found" }
  /** The API failed, so we can't say it doesn't exist. Never carries data. */
  | { kind: "unavailable" };

export async function resolveSlug(
  slug: string,
  options: LookupOptions
): Promise<SlugResolution> {
  if (!isRoutableSlug(slug)) return { kind: "not-found" };

  const product = await lookupProduct(slug, options);
  if (product.status === "visible") return { kind: "product" };
  return product.status === "error"
    ? { kind: "unavailable" }
    : { kind: "not-found" };
}

// A product is public only if the storefront API says so. Today the API answers
// 200 with `available: false` for a hidden product; once the backend changes it
// answers 404. Both mean "not found" here, so the web is right whichever deploys
// first. No window or Node access: used by getServerSideProps and the browser.

export const isProductHidden = (
  attributes: { available?: unknown } | null | undefined
): boolean => attributes?.available === false;

export class ProductNotFoundError extends Error {
  status = 404;

  constructor(slug: string) {
    super(`Product not found: ${slug}`);
    this.name = "ProductNotFoundError";
    Object.setPrototypeOf(this, ProductNotFoundError.prototype);
  }
}

export const isProductNotFoundError = (err: unknown): boolean =>
  err instanceof ProductNotFoundError ||
  (err as { status?: number } | null | undefined)?.status === 404;

/** Pass a visible product document through; anything else is not found. */
export function assertProductVisible<T>(doc: T, slug: string): T {
  const data = (doc as { data?: { attributes?: { available?: unknown } } })
    ?.data;
  if (!data || isProductHidden(data.attributes)) {
    throw new ProductNotFoundError(slug);
  }
  return doc;
}

/**
 * The robots meta in the served HTML. It belongs in _document because the app
 * server-renders a loading state, so next/head tags from a page only appear
 * after hydration. Noindex is for pages with nothing to index.
 */
export const robotsContent = (
  page: string,
  pageProps?: { type?: string } | null
): string =>
  page === "/404" || page === "/_error" || pageProps?.type === "unavailable"
    ? "noindex"
    : "noodp";

/** react-query `retry`: not-found is an answer, anything else may be transient. */
export const shouldRetryProductFetch = (
  failureCount: number,
  err: unknown
): boolean => !isProductNotFoundError(err) && failureCount < 3;

/**
 * Recently viewed lives in localStorage, so it can name a product that has
 * since been hidden. The products listing only holds available products: when
 * it's complete, an entry missing from it is gone. A partial or failed listing
 * proves nothing, so the entries stay (their links lead to the 404 page).
 */
export function visibleRecentProducts<T extends { slug: string }>(
  recent: T[],
  listing: unknown
): T[] {
  const { data, meta } = (listing || {}) as {
    data?: unknown;
    meta?: { total_pages?: number };
  };
  if (!Array.isArray(data) || meta?.total_pages !== 1) return recent;
  const listed = new Set(
    data.map((p: { attributes?: { slug?: string } }) => p?.attributes?.slug)
  );
  return recent.filter((p) => listed.has(p.slug));
}

// Featured products come from a Spree taxon (default `collections/featured`):
// membership and order are managed in the admin (Products → Taxons). Plain
// fetch, no storage/window access, so it runs in getStaticProps as well as in
// the browser. Any failure means "no featured": callers render nothing.

import { JsonApiResource } from "./productMedia";
import {
  describeRequestError,
  requestWithVideosFallback
} from "./spreeInclude";

export const DEFAULT_FEATURED_TAXON = "collections/featured";

export const FEATURED_INCLUDE =
  "images,variants,option_types,variants.option_values,product_properties";

export interface ProductsDoc {
  data: JsonApiResource[];
  included?: JsonApiResource[];
  /** Spree's paging meta, when the API sent it. */
  meta?: { total_count?: number; total_pages?: number; count?: number };
}

export const featuredTaxonPermalink = (): string =>
  (process.env.NEXT_PUBLIC_FEATURED_TAXON || "").trim() ||
  DEFAULT_FEATURED_TAXON;

type FetchLike = (
  url: string,
  init?: { headers?: Record<string, string>; signal?: AbortSignal }
) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  text?: () => Promise<string>;
}>;

export interface FetchFeaturedOptions {
  /** The Spree API URL (NEXT_PUBLIC_SPREE_API_URL). */
  baseUrl: string;
  permalink?: string;
  perPage?: number;
  /** 1-based page of the taxon's products. */
  page?: number;
  fetchImpl?: FetchLike;
  /**
   * Give up (no featured) after this long. getStaticProps awaits this, so a
   * hung Spree must not hang the build or an ISR revalidate.
   */
  timeoutMs?: number;
}

const HEADERS = { "Content-Type": "application/vnd.api+json" };

export async function fetchFeaturedProducts({
  baseUrl,
  permalink = featuredTaxonPermalink(),
  perPage = 12,
  page,
  fetchImpl,
  timeoutMs = 8000
}: FetchFeaturedOptions): Promise<ProductsDoc | null> {
  const doFetch: FetchLike | undefined =
    fetchImpl ||
    (typeof fetch === "function" ? (fetch as unknown as FetchLike) : undefined);
  if (!doFetch) return null;
  const base = baseUrl.replace(/\/+$/, "");
  const path = permalink
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  if (!path) return null;

  // One deadline for the whole lookup (taxon, products, a videos retry).
  const controller =
    typeof AbortController === "function" ? new AbortController() : null;
  const init = { headers: HEADERS, signal: controller?.signal };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      controller?.abort();
      resolve(null);
    }, timeoutMs);
  });

  const lookup = async (): Promise<ProductsDoc | null> => {
    const taxonRes = await doFetch(
      `${base}/api/v2/storefront/taxons/${path}`,
      init
    );
    if (!taxonRes.ok) return null;
    const taxonId = (await taxonRes.json())?.data?.id;
    // Never query without a real id: filter[taxons] with an unknown id
    // returns the whole catalog.
    if (!taxonId) return null;

    const doc = await requestWithVideosFallback<ProductsDoc>(
      FEATURED_INCLUDE,
      async (include) => {
        const url =
          `${base}/api/v2/storefront/products?filter[taxons]=${encodeURIComponent(
            String(taxonId)
          )}` +
          `&sort_by=default&per_page=${perPage}` +
          (page && page > 1 ? `&page=${page}` : "") +
          `&include=${include}`;
        const res = await doFetch(url, init);
        if (!res.ok) {
          const body = res.text ? await res.text().catch(() => "") : "";
          throw Object.assign(new Error(body), { status: res.status });
        }
        return res.json();
      },
      describeRequestError
    );

    if (!doc || !Array.isArray(doc.data) || doc.data.length === 0) return null;
    const out: ProductsDoc = { data: doc.data, included: doc.included || [] };
    if (doc.meta) out.meta = doc.meta;
    return out;
  };

  try {
    return await Promise.race([lookup().catch(() => null), deadline]);
  } finally {
    clearTimeout(timer);
  }
}

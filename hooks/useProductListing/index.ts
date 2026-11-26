import { useQuery } from "react-query";
import { IProducts } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { QueryKeys } from "../queryKeys";

/**
 * A paginated, server-sorted product listing from the storefront API, for the
 * category and tag pages. Uses the signed-in user's token in the browser
 * (wholesale accounts get wholesale pricing) and fetches anonymously on the server.
 */

export const LISTING_PER_PAGE = 24;

/** Sorts the storefront API accepts for products (price is special-cased by Spree). */
export const LISTING_SORTS = [
  { value: "-created_at", label: "Newest" },
  { value: "price", label: "Price (Low to High)" },
  { value: "-price", label: "Price (High to Low)" }
] as const;

export const DEFAULT_LISTING_SORT = LISTING_SORTS[0].value;

/** The includes ProductList needs for images and colour swatches. */
const LISTING_INCLUDES = "images,variants,option_types,variants.option_values";

export interface ProductListingParams {
  /** `filter[taxons]`: a taxon id; Spree includes its descendants. */
  taxonId?: string;
  /** `filter[name]`: case-insensitive substring match on the product name. */
  name?: string;
  page: number;
  perPage?: number;
  sort: string;
}

export interface ProductListingOptions {
  bearerToken?: string;
  signal?: AbortSignal;
}

export const fetchProductListing = async (
  params: ProductListingParams,
  options: ProductListingOptions = {}
): Promise<IProducts> => {
  let accessToken = options.bearerToken;
  if (!accessToken && typeof window !== "undefined") {
    const storage = (await import("../../config/storage")).default;
    accessToken = (await storage.getToken())?.access_token;
  }

  const query = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.perPage ?? LISTING_PER_PAGE),
    sort: params.sort,
    include: LISTING_INCLUDES
  });
  if (params.taxonId) query.set("filter[taxons]", params.taxonId);
  if (params.name) query.set("filter[name]", params.name);

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_SPREE_API_URL || ""
    }/api/v2/storefront/products?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      signal: options.signal
    }
  );
  if (!res.ok) throw new Error(`Products request failed: ${res.status}`);
  return res.json();
};

export const useProductListing = (
  params: ProductListingParams,
  enabled: boolean = true
) =>
  useQuery<IProducts, Error>(
    [QueryKeys.PRODUCT_LISTING, params],
    ({ signal }) => fetchProductListing(params, { signal }),
    { enabled, keepPreviousData: true, staleTime: 60 * 1000 }
  );

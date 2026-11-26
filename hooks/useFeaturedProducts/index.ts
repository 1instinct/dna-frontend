import { useQuery } from "react-query";
import { QueryKeys } from "../queryKeys";
import {
  featuredTaxonPermalink,
  fetchFeaturedProducts,
  ProductsDoc
} from "../../lib/featured";

/**
 * Products in the Featured taxon (NEXT_PUBLIC_FEATURED_TAXON, default
 * collections/featured), in the admin's taxon order. Resolves to null when the
 * taxon is missing, empty or fails to load: callers then render nothing.
 */
export const useFeaturedProducts = (enabled = true) => {
  const permalink = featuredTaxonPermalink();
  return useQuery<ProductsDoc | null>(
    [QueryKeys.FEATURED_PRODUCTS, permalink],
    () =>
      fetchFeaturedProducts({
        baseUrl: process.env.NEXT_PUBLIC_SPREE_API_URL || "",
        permalink
      }),
    { enabled, staleTime: 5 * 60 * 1000, retry: false }
  );
};

export { fetchFeaturedProducts };

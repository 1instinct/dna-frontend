import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "react-query";
import { QueryKeys } from "@hooks/queryKeys";
import { fetchFeaturedProducts, ProductsDoc } from "../../lib/featured";
import { marketplaceTaxonPermalink } from "../../lib/marketplace";

const baseUrl = () =>
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_SPREE_API_URL || "http://localhost:8080";

export const MARKETPLACE_PAGE_SIZE = 24;

/**
 * One page of the marketplace taxon's products (its child taxons included).
 * Null when the marketplace is off, or the taxon is missing, empty or failing.
 */
export const fetchMarketplaceProducts = async (
  page = 1
): Promise<ProductsDoc | null> => {
  const permalink = marketplaceTaxonPermalink();
  if (!permalink) return null;
  return fetchFeaturedProducts({
    baseUrl: baseUrl(),
    permalink,
    perPage: MARKETPLACE_PAGE_SIZE,
    page
  });
};

/** The pages loaded so far, merged; `fetchNextPage` loads one more. */
export const useMarketplaceProducts = (enabled = true) => {
  const q = useInfiniteQuery<ProductsDoc | null>(
    [QueryKeys.MARKETPLACE_PRODUCTS, marketplaceTaxonPermalink()],
    ({ pageParam = 1 }) => fetchMarketplaceProducts(pageParam),
    {
      enabled: enabled && !!marketplaceTaxonPermalink(),
      staleTime: 60_000,
      retry: false,
      getNextPageParam: (last, all) => {
        const pages = last?.meta?.total_pages;
        // Without paging meta, a full page means there may be more.
        const more = pages
          ? all.length < pages
          : (last?.data.length || 0) >= MARKETPLACE_PAGE_SIZE;
        return more ? all.length + 1 : undefined;
      }
    }
  );
  const { data, included, total } = useMemo(() => {
    const pages = (q.data?.pages || []).filter((p): p is ProductsDoc => !!p);
    const seen = new Set<string>();
    return {
      data: pages
        .flatMap((p) => p.data)
        .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))),
      included: pages.flatMap((p) => p.included || []),
      total: pages[0]?.meta?.total_count
    };
  }, [q.data]);
  return {
    data,
    included,
    total,
    isLoading: q.isLoading,
    isError: q.isError,
    hasNextPage: !!q.hasNextPage,
    isFetchingNextPage: q.isFetchingNextPage,
    fetchNextPage: () => q.fetchNextPage()
  };
};

export interface MarketplaceTaxon {
  id: number;
  name: string;
  permalink: string;
}

/**
 * The marketplace taxon's children: the categories a creator may file a
 * product under. Empty when the marketplace is off.
 */
export const useMarketplaceTaxons = () =>
  useQuery<MarketplaceTaxon[]>(
    [QueryKeys.MARKETPLACE_PRODUCTS, "taxons", marketplaceTaxonPermalink()],
    async () => {
      const permalink = marketplaceTaxonPermalink();
      if (!permalink) return [];
      const path = permalink.split("/").map(encodeURIComponent).join("/");
      const res = await fetch(
        `/api/v2/storefront/taxons/${path}?include=children`,
        { headers: { "Content-Type": "application/vnd.api+json" } }
      );
      if (!res.ok) throw new Error(`taxons ${res.status}`);
      const doc = await res.json();
      return ((doc?.included || []) as any[])
        .filter((t) => t?.type === "taxon")
        .map((t) => ({
          id: Number(t.id),
          name: String(t.attributes?.name || ""),
          permalink: String(t.attributes?.permalink || "")
        }));
    },
    { staleTime: 10 * 60_000, retry: false }
  );

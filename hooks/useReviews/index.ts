import { useInfiniteQuery, useQuery } from "react-query";
import { dnaFetch, isDnaApiError, DnaAuthMode } from "@lib/api/dnaFetch";
import { normalizeReviewFilters, NormalizedReviewFilters } from "@lib/reviews";
import type {
  ReviewListFilters,
  ReviewListResponse,
  ReviewScope,
  ReviewSummary
} from "../../types/reviews";
import { QueryKeys } from "../queryKeys";

export interface ReviewFetchOptions {
  /** Defaults to "optional" (Bearer when signed in). SSR passes "none". */
  auth?: DnaAuthMode;
  bearerToken?: string;
  signal?: AbortSignal;
}

const productPath = (productId: string | number, suffix: string) =>
  `/products/${encodeURIComponent(String(productId))}/${suffix}`;

/**
 * Runs a scoped request and degrades gracefully:
 * - 403 on `all`/`wholesale` (not a wholesale account after all): retry as retail.
 * - 401 (stale Bearer token): retry without the token; reviews are public.
 * The response's own `scope` tells the UI what it actually got.
 */
const withScopeFallback = async <T>(
  scope: ReviewScope,
  options: ReviewFetchOptions,
  run: (scope: ReviewScope, auth: DnaAuthMode) => Promise<T>
): Promise<T> => {
  const auth = options.auth || "optional";
  try {
    return await run(scope, auth);
  } catch (error) {
    if (!isDnaApiError(error)) throw error;
    if (error.status === 403 && scope !== "retail") {
      return run("retail", auth);
    }
    if (error.status === 401 && auth !== "none") {
      return run("retail", "none");
    }
    throw error;
  }
};

export const fetchReviewSummary = (
  productId: string | number,
  scope: ReviewScope = "retail",
  options: ReviewFetchOptions = {}
): Promise<ReviewSummary> =>
  withScopeFallback(scope, options, (s, auth) =>
    dnaFetch<ReviewSummary>(productPath(productId, "review_summary"), {
      query: { scope: s },
      auth,
      bearerToken: options.bearerToken,
      signal: options.signal
    })
  );

export const fetchProductReviews = (
  productId: string | number,
  filters: ReviewListFilters & { page?: number },
  options: ReviewFetchOptions = {}
): Promise<ReviewListResponse> => {
  const f = normalizeReviewFilters(filters);
  return withScopeFallback(f.scope, options, (s, auth) =>
    dnaFetch<ReviewListResponse>(productPath(productId, "reviews"), {
      query: {
        scope: s,
        sort: f.sort,
        rating: f.rating.length ? f.rating : undefined,
        with_photos: f.with_photos ? 1 : undefined,
        written: f.written ? 1 : undefined,
        page: filters.page || 1,
        per_page: f.per_page
      },
      auth,
      bearerToken: options.bearerToken,
      signal: options.signal
    })
  );
};

export const reviewSummaryKey = (
  productId: string | number,
  scope: ReviewScope = "retail"
) => [QueryKeys.REVIEW_SUMMARY, String(productId), scope] as const;

export const productReviewsKey = (
  productId: string | number,
  filters: ReviewListFilters = {}
) =>
  [
    QueryKeys.PRODUCT_REVIEWS,
    String(productId),
    normalizeReviewFilters(filters)
  ] as const;

/** Next page number from a list response, or undefined on the last page. */
export const getNextReviewsPage = (last: ReviewListResponse) =>
  last?.meta && last.meta.page < last.meta.total_pages
    ? last.meta.page + 1
    : undefined;

/** Don't retry client errors (403/404/422...); retry network/5xx once. */
const retryReviews = (failureCount: number, error: unknown) => {
  if (isDnaApiError(error) && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 1;
};

interface ReviewQueryOptions {
  enabled?: boolean;
}

export const useReviewSummary = (
  productId: string | number | undefined,
  scope: ReviewScope = "retail",
  { enabled = true }: ReviewQueryOptions = {}
) =>
  useQuery<ReviewSummary, unknown>(
    reviewSummaryKey(productId || "", scope),
    ({ signal }) => fetchReviewSummary(productId as string, scope, { signal }),
    {
      enabled: enabled && !!productId,
      keepPreviousData: true,
      staleTime: 60_000,
      retry: retryReviews,
      refetchOnWindowFocus: false
    }
  );

export type UseProductReviewsFilters = ReviewListFilters;

export const useProductReviews = (
  productId: string | number | undefined,
  filters: UseProductReviewsFilters = {},
  { enabled = true }: ReviewQueryOptions = {}
) => {
  const normalized: NormalizedReviewFilters = normalizeReviewFilters(filters);
  return useInfiniteQuery<ReviewListResponse, unknown>(
    productReviewsKey(productId || "", normalized),
    ({ pageParam = 1, signal }) =>
      fetchProductReviews(
        productId as string,
        { ...normalized, page: pageParam },
        { signal }
      ),
    {
      enabled: enabled && !!productId,
      getNextPageParam: getNextReviewsPage,
      keepPreviousData: true,
      staleTime: 60_000,
      retry: retryReviews,
      refetchOnWindowFocus: false
    }
  );
};

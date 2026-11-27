import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "react-query";
import { dnaFetch, DnaAuthMode, isDnaApiError } from "@lib/api/dnaFetch";
import {
  normalizeStoreReviewFilters,
  NormalizedStoreReviewFilters,
  REVIEWS_ENABLED
} from "@lib/reviews";
import { useReviewUserId } from "../useReviews";
import type {
  OwnStoreReview,
  StoreReviewConflict,
  StoreReviewForm,
  StoreReviewInput,
  StoreReviewListFilters,
  StoreReviewListParams,
  StoreReviewListResponse,
  StoreReviewMutationResponse,
  StoreReviewSummary,
  UpdateStoreReviewInput
} from "../../types/reviews";
import { QueryKeys } from "../queryKeys";

/**
 * Store reviews (M5): `/api/v1/store_reviews/*`. Public reads are retail
 * only and sent without a Bearer (a stale token must never turn a public
 * page into a 401). Every endpoint answers 503 `not_enabled` while reviews
 * or store reviews are switched off in admin; callers hide themselves then.
 */

export interface StoreReviewFetchOptions {
  auth?: DnaAuthMode;
  signal?: AbortSignal;
}

export const fetchStoreReviewSummary = (
  options: StoreReviewFetchOptions = {}
): Promise<StoreReviewSummary> =>
  dnaFetch<StoreReviewSummary>("/store_reviews/summary", {
    auth: options.auth || "none",
    signal: options.signal
  });

export const fetchStoreReviews = (
  params: StoreReviewListParams = {},
  options: StoreReviewFetchOptions = {}
): Promise<StoreReviewListResponse> => {
  const f = normalizeStoreReviewFilters(params);
  return dnaFetch<StoreReviewListResponse>("/store_reviews", {
    query: {
      sort: f.sort,
      rating: f.rating.length ? f.rating : undefined,
      written: f.written ? 1 : undefined,
      page: params.page || 1,
      per_page: f.per_page
    },
    auth: options.auth || "none",
    signal: options.signal
  });
};

export const storeReviewSummaryKey = () =>
  [QueryKeys.STORE_REVIEW_SUMMARY] as const;

/** Only list queries live under `STORE_REVIEWS` (vote patches rely on that). */
export const storeReviewsKey = (filters: StoreReviewListFilters = {}) =>
  [QueryKeys.STORE_REVIEWS, normalizeStoreReviewFilters(filters)] as const;

export const getNextStoreReviewsPage = (last: StoreReviewListResponse) =>
  last?.meta && last.meta.page < last.meta.total_pages
    ? last.meta.page + 1
    : undefined;

/** No retries for client errors or 503 `not_enabled`; one retry otherwise. */
const retryStoreReviews = (failureCount: number, error: unknown) => {
  if (
    isDnaApiError(error) &&
    ((error.status >= 400 && error.status < 500) || error.status === 503)
  ) {
    return false;
  }
  return failureCount < 1;
};

interface StoreReviewQueryOptions {
  enabled?: boolean;
}

/** `GET /store_reviews/summary`. Shared by the footer badge and `/reviews`. */
export const useStoreReviewSummary = ({
  enabled = true
}: StoreReviewQueryOptions = {}) =>
  useQuery<StoreReviewSummary, unknown>(
    storeReviewSummaryKey(),
    ({ signal }) => fetchStoreReviewSummary({ signal }),
    {
      enabled: REVIEWS_ENABLED && enabled,
      staleTime: 5 * 60_000,
      retry: retryStoreReviews,
      refetchOnWindowFocus: false
    }
  );

/** `GET /store_reviews` as an infinite list ("Show more"). */
export const useStoreReviews = (
  filters: StoreReviewListFilters = {},
  { enabled = true }: StoreReviewQueryOptions = {}
) => {
  const normalized: NormalizedStoreReviewFilters =
    normalizeStoreReviewFilters(filters);
  return useInfiniteQuery<StoreReviewListResponse, unknown>(
    storeReviewsKey(normalized),
    ({ pageParam = 1, signal }) =>
      fetchStoreReviews({ ...normalized, page: pageParam }, { signal }),
    {
      enabled: REVIEWS_ENABLED && enabled,
      getNextPageParam: getNextStoreReviewsPage,
      keepPreviousData: true,
      staleTime: 60_000,
      retry: retryStoreReviews,
      refetchOnWindowFocus: false
    }
  );
};

export const storeReviewFormKey = (userId: string | null) =>
  [QueryKeys.STORE_REVIEW_FORM, userId] as const;

/**
 * `GET /store_reviews/form` (Bearer): eligibility, questions, limits and the
 * customer's existing store review. Only runs when signed in.
 */
export const useStoreReviewForm = ({
  enabled = true
}: StoreReviewQueryOptions = {}) => {
  const userId = useReviewUserId();
  return useQuery<StoreReviewForm, unknown>(
    storeReviewFormKey(userId),
    ({ signal }) =>
      dnaFetch<StoreReviewForm>("/store_reviews/form", {
        auth: "required",
        signal
      }),
    {
      enabled: REVIEWS_ENABLED && enabled && !!userId,
      staleTime: 60_000,
      retry: retryStoreReviews,
      refetchOnWindowFocus: false
    }
  );
};

/* Writes ---------------------------------------------------------------- */

export interface StoreReviewWriteOptions {
  /**
   * The review request token from an email link, sent as `X-Review-Token`
   * instead of a Bearer. The review is then tied to that order.
   */
  reviewToken?: string;
}

const writeAuth = ({ reviewToken }: StoreReviewWriteOptions) =>
  reviewToken
    ? ({ auth: "none", reviewToken } as const)
    : ({ auth: "required" } as const);

const unwrapReview = (response: StoreReviewMutationResponse): OwnStoreReview =>
  response.review;

/**
 * JSON body: empty strings are kept on PATCH (they clear a deleted title or
 * body) and dropped on POST; attribute ratings outside 1–5 are dropped.
 */
const storeReviewBody = (
  input: Partial<StoreReviewInput>,
  { keepEmpty }: { keepEmpty: boolean }
) => {
  const body: Record<string, unknown> = {};
  if (input.rating) body.rating = input.rating;
  (["title", "body"] as const).forEach((key) => {
    const value = input[key];
    if (value === undefined) return;
    if (!keepEmpty && value.trim() === "") return;
    body[key] = value;
  });
  if (input.display_name && input.display_name.trim()) {
    body.display_name = input.display_name.trim();
  }
  const ratings: Record<string, number> = {};
  Object.keys(input.attribute_ratings || {}).forEach((key) => {
    const value = input.attribute_ratings?.[key];
    if (typeof value === "number" && value >= 1 && value <= 5) {
      ratings[key] = value;
    }
  });
  if (Object.keys(ratings).length) body.attribute_ratings = ratings;
  return body;
};

const postStoreReview = async (
  input: StoreReviewInput,
  options: StoreReviewWriteOptions
) =>
  unwrapReview(
    await dnaFetch<StoreReviewMutationResponse>("/store_reviews", {
      method: "POST",
      body: storeReviewBody(input, { keepEmpty: false }),
      ...writeAuth(options)
    })
  );

const patchStoreReview = async (
  { id, ...input }: UpdateStoreReviewInput,
  options: StoreReviewWriteOptions,
  // False when the customer never saw the stored text (the 409 fallback), so
  // an empty field can't wipe a title or body written earlier.
  keepEmpty = true
) =>
  unwrapReview(
    await dnaFetch<StoreReviewMutationResponse>(
      `/store_reviews/${encodeURIComponent(String(id))}`,
      {
        method: "PATCH",
        body: storeReviewBody(input, { keepEmpty }),
        ...writeAuth(options)
      }
    )
  );

/** The `review_id` of a 409 `already_reviewed`, or null. */
export const alreadyReviewedId = (error: unknown): number | null => {
  if (!isDnaApiError(error) || error.status !== 409) return null;
  const body = error.body as Partial<StoreReviewConflict> | undefined;
  const id = Number(body?.review_id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/** Stats, lists and the form all change after a write. */
const invalidateStoreReviews = (
  queryClient: ReturnType<typeof useQueryClient>
) =>
  Promise.all([
    queryClient.invalidateQueries(QueryKeys.STORE_REVIEW_SUMMARY),
    queryClient.invalidateQueries(QueryKeys.STORE_REVIEWS),
    queryClient.invalidateQueries(QueryKeys.STORE_REVIEW_FORM),
    queryClient.invalidateQueries(QueryKeys.REVIEW_REQUEST)
  ]);

/** `POST /store_reviews` (201). A second POST gets 409; see `useSaveStoreReview`. */
export const useCreateStoreReview = (options: StoreReviewWriteOptions = {}) => {
  const queryClient = useQueryClient();
  return useMutation<OwnStoreReview, unknown, StoreReviewInput>(
    (input) => postStoreReview(input, options),
    { onSuccess: () => invalidateStoreReviews(queryClient) }
  );
};

/** `PATCH /store_reviews/:id` (200). Edits go back through moderation. */
export const useUpdateStoreReview = (options: StoreReviewWriteOptions = {}) => {
  const queryClient = useQueryClient();
  return useMutation<OwnStoreReview, unknown, UpdateStoreReviewInput>(
    (input) => patchStoreReview(input, options),
    { onSuccess: () => invalidateStoreReviews(queryClient) }
  );
};

export interface SaveStoreReviewInput extends StoreReviewInput {
  /** The existing review to edit; omit to create. */
  id?: number | null;
}

/**
 * Create or edit in one call: PATCH when `id` is known, otherwise POST, and
 * when the POST answers 409 `already_reviewed` (one per account, or one per
 * order with a token), PATCH the `review_id` it returns.
 */
export const useSaveStoreReview = (options: StoreReviewWriteOptions = {}) => {
  const queryClient = useQueryClient();
  return useMutation<OwnStoreReview, unknown, SaveStoreReviewInput>(
    async ({ id, ...input }) => {
      if (id) return patchStoreReview({ id, ...input }, options);
      try {
        return await postStoreReview(input, options);
      } catch (error) {
        const existingId = alreadyReviewedId(error);
        if (!existingId) throw error;
        return patchStoreReview({ id: existingId, ...input }, options, false);
      }
    },
    { onSuccess: () => invalidateStoreReviews(queryClient) }
  );
};

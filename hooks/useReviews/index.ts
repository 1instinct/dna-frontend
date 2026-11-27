import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "react-query";
import { dnaFetch, isDnaApiError, DnaAuthMode } from "@lib/api/dnaFetch";
import {
  getVisitorId,
  normalizeReviewFilters,
  NormalizedReviewFilters
} from "@lib/reviews";
import { useAuth } from "../../config/auth";
import type {
  CreateReviewInput,
  MyReviewsResponse,
  OwnReview,
  ReportReviewInput,
  Review,
  ReviewForm,
  ReviewablesResponse,
  ReviewListFilters,
  ReviewListResponse,
  ReviewMutationResponse,
  ReviewRequestOptOutResponse,
  ReviewRequestPayload,
  ReviewScope,
  ReviewSummary,
  ReviewVoteResult,
  UpdateReviewInput
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

/* ------------------------------------------------------------------ */
/* Write path (M2): composer data, own reviews, votes, reports          */
/* ------------------------------------------------------------------ */

/** The signed-in account id, or null. Part of every per-user query key. */
export const useReviewUserId = (): string | null => {
  const { user } = useAuth();
  const id = (user as { data?: { id?: string | number } } | null | undefined)
    ?.data?.id;
  return user ? String(id ?? "me") : null;
};

export const reviewFormKey = (
  productId: string | number,
  userId: string | null
) => [QueryKeys.REVIEW_FORM, String(productId), userId] as const;

/**
 * `GET /products/:id/review_form`: eligibility, the customer's existing
 * review, questions, limits and points. Only runs when signed in; signed-out
 * shoppers never see a "Write a review" button on the PDP.
 */
export const useReviewForm = (
  productId: string | number | undefined,
  { enabled = true }: ReviewQueryOptions = {}
) => {
  const userId = useReviewUserId();
  return useQuery<ReviewForm, unknown>(
    reviewFormKey(productId || "", userId),
    ({ signal }) =>
      dnaFetch<ReviewForm>(productPath(productId as string, "review_form"), {
        auth: "required",
        signal
      }),
    {
      enabled: enabled && !!productId && !!userId,
      staleTime: 60_000,
      retry: retryReviews,
      refetchOnWindowFocus: false
    }
  );
};

/** `GET /account/reviewables`: received products, newest purchase first. */
export const useReviewables = ({ enabled = true }: ReviewQueryOptions = {}) => {
  const userId = useReviewUserId();
  return useQuery<ReviewablesResponse, unknown>(
    [QueryKeys.REVIEWABLES, userId],
    ({ signal }) =>
      dnaFetch<ReviewablesResponse>("/account/reviewables", {
        auth: "required",
        signal
      }),
    {
      enabled: enabled && !!userId,
      staleTime: 60_000,
      retry: retryReviews,
      refetchOnWindowFocus: false
    }
  );
};

export const MY_REVIEWS_PER_PAGE = 10;

/** `GET /account/reviews`: the customer's reviews, any status, newest first. */
export const useMyReviews = ({ enabled = true }: ReviewQueryOptions = {}) => {
  const userId = useReviewUserId();
  return useInfiniteQuery<MyReviewsResponse, unknown>(
    [QueryKeys.MY_REVIEWS, userId],
    ({ pageParam = 1, signal }) =>
      dnaFetch<MyReviewsResponse>("/account/reviews", {
        query: { page: pageParam, per_page: MY_REVIEWS_PER_PAGE },
        auth: "required",
        signal
      }),
    {
      enabled: enabled && !!userId,
      getNextPageParam: (last) =>
        last?.meta && last.meta.page < last.meta.total_pages
          ? last.meta.page + 1
          : undefined,
      staleTime: 30_000,
      retry: retryReviews,
      refetchOnWindowFocus: false
    }
  );
};

const appendText = (
  form: FormData,
  key: string,
  value: string | undefined,
  keepEmpty: boolean
) => {
  if (value === undefined) return;
  if (!keepEmpty && value.trim() === "") return;
  form.append(key, value);
};

/** Shared multipart body for POST and PATCH. */
const reviewFormData = (
  input: Partial<CreateReviewInput> & UpdateFieldsOnly,
  { keepEmpty }: { keepEmpty: boolean }
): FormData => {
  const form = new FormData();
  if (input.product_id !== undefined) {
    form.append("product_id", String(input.product_id));
  }
  if (input.line_item_id) {
    form.append("line_item_id", String(input.line_item_id));
  }
  if (input.rating) form.append("rating", String(input.rating));
  appendText(form, "title", input.title, keepEmpty);
  appendText(form, "body", input.body, keepEmpty);
  appendText(form, "display_name", input.display_name, false);
  Object.keys(input.attribute_ratings || {}).forEach((key) => {
    const value = input.attribute_ratings?.[key];
    if (typeof value === "number" && value >= 1 && value <= 5) {
      form.append(`attribute_ratings[${key}]`, String(value));
    }
  });
  (input.photos || []).forEach((photo, index) => {
    const name =
      photo instanceof File && photo.name ? photo.name : `photo-${index}.jpg`;
    form.append("photos[]", photo, name);
  });
  (input.remove_photo_ids || []).forEach((id) =>
    form.append("remove_photo_ids[]", String(id))
  );
  return form;
};

interface UpdateFieldsOnly {
  remove_photo_ids?: Array<number | string>;
}

/** Everything a write can change: stats, lists, eligibility, own reviews. */
const invalidateAfterWrite = (queryClient: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    queryClient.invalidateQueries(QueryKeys.REVIEW_SUMMARY),
    queryClient.invalidateQueries(QueryKeys.PRODUCT_REVIEWS),
    queryClient.invalidateQueries(QueryKeys.REVIEWABLES),
    queryClient.invalidateQueries(QueryKeys.MY_REVIEWS),
    queryClient.invalidateQueries(QueryKeys.REVIEW_FORM),
    queryClient.invalidateQueries(QueryKeys.REVIEW_REQUEST),
    // The PDP star line reads avg_rating from the product payload.
    queryClient.invalidateQueries(QueryKeys.PRODUCT)
  ]);

export interface ReviewWriteOptions {
  /**
   * The review request token from an email link. It is sent as
   * `X-Review-Token` instead of a Bearer: the token alone proves the
   * purchase, and a stale Bearer would turn the request into a 401.
   */
  reviewToken?: string;
}

const writeAuth = ({ reviewToken }: ReviewWriteOptions) =>
  reviewToken
    ? ({ auth: "none", reviewToken } as const)
    : ({ auth: "required" } as const);

/**
 * `POST /reviews` (multipart). Returns the own-review shape; posting for a
 * product the customer already reviewed edits that review (200).
 */
export const useCreateReview = (options: ReviewWriteOptions = {}) => {
  const queryClient = useQueryClient();
  return useMutation<OwnReview, unknown, CreateReviewInput>(
    async (input) => {
      const response = await dnaFetch<ReviewMutationResponse>("/reviews", {
        method: "POST",
        formData: reviewFormData(input, { keepEmpty: false }),
        ...writeAuth(options)
      });
      return response.review;
    },
    { onSuccess: () => invalidateAfterWrite(queryClient) }
  );
};

/** `PATCH /reviews/:id` (multipart). New photos add to the kept ones. */
export const useUpdateReview = (options: ReviewWriteOptions = {}) => {
  const queryClient = useQueryClient();
  return useMutation<OwnReview, unknown, UpdateReviewInput>(
    async ({ id, ...input }) => {
      const response = await dnaFetch<ReviewMutationResponse>(
        `/reviews/${encodeURIComponent(String(id))}`,
        {
          method: "PATCH",
          // Empty strings clear a title or body the customer deleted.
          formData: reviewFormData(input, { keepEmpty: true }),
          ...writeAuth(options)
        }
      );
      return response.review;
    },
    { onSuccess: () => invalidateAfterWrite(queryClient) }
  );
};

/** `DELETE /reviews/:id`. Points already earned stay. */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, number>(
    (id) =>
      dnaFetch<void>(`/reviews/${encodeURIComponent(String(id))}`, {
        method: "DELETE",
        auth: "required"
      }),
    { onSuccess: () => invalidateAfterWrite(queryClient) }
  );
};

/* Review requests (M4 email links) ------------------------------------ */

export const reviewRequestKey = (token: string) =>
  [QueryKeys.REVIEW_REQUEST, token] as const;

const reviewRequestPath = (token: string, suffix = "") =>
  `/review_requests/${encodeURIComponent(token)}${suffix}`;

/**
 * `GET /review_requests/:token`: the order's items, existing reviews,
 * questions, points and limits for the `/review/[token]` page. The token is
 * the credential, so no Bearer is sent. 404 means the link is dead
 * (expired, replaced by a newer email, opted out); that isn't retried.
 */
export const useReviewRequest = (
  token: string | undefined,
  { enabled = true }: ReviewQueryOptions = {}
) =>
  useQuery<ReviewRequestPayload, unknown>(
    reviewRequestKey(token || ""),
    ({ signal }) =>
      dnaFetch<ReviewRequestPayload>(reviewRequestPath(token as string), {
        auth: "none",
        signal
      }),
    {
      enabled: enabled && !!token,
      staleTime: 60_000,
      retry: retryReviews,
      refetchOnWindowFocus: false
    }
  );

/**
 * `POST /review_requests/:token/opt_out`: no more review emails to the
 * order's address. Only ever called from an explicit click, never on page
 * load (mail scanners open links). Calling it twice is harmless.
 */
export const useOptOutReviewRequest = (token: string | undefined) =>
  useMutation<ReviewRequestOptOutResponse, unknown, void>(() =>
    dnaFetch<ReviewRequestOptOutResponse>(
      reviewRequestPath(token as string, "/opt_out"),
      { method: "POST", auth: "none" }
    )
  );

/* Votes --------------------------------------------------------------- */

/** localStorage key remembering this browser's helpful votes. */
export const REVIEW_VOTES_STORAGE_KEY = "dna_review_votes";
const MAX_STORED_VOTES = 300;

type VoteMap = Record<string, boolean>;

const readStoredVotes = (): VoteMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REVIEW_VOTES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeStoredVotes = (votes: VoteMap) => {
  if (typeof window === "undefined") return;
  try {
    const keys = Object.keys(votes);
    const trimmed: VoteMap = {};
    keys.slice(Math.max(0, keys.length - MAX_STORED_VOTES)).forEach((key) => {
      trimmed[key] = votes[key];
    });
    window.localStorage.setItem(
      REVIEW_VOTES_STORAGE_KEY,
      JSON.stringify(trimmed)
    );
  } catch {
    // Storage full or blocked: the vote still counts on the server.
  }
};

const votesKey = [QueryKeys.REVIEW_VOTES] as const;

/** This browser's helpful votes, `{ [reviewId]: true | false }`. */
export const useReviewVotes = () =>
  useQuery<VoteMap>(votesKey, () => readStoredVotes(), {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    // Server-rendered markup has no votes; the browser fills them in.
    initialData: () => (typeof window === "undefined" ? {} : readStoredVotes())
  });

type ReviewPages = InfiniteData<ReviewListResponse>;

const patchReviewInLists = (
  queryClient: ReturnType<typeof useQueryClient>,
  reviewId: number,
  patch: (review: Review) => Review
) =>
  queryClient.setQueriesData<ReviewPages | undefined>(
    QueryKeys.PRODUCT_REVIEWS,
    (data) => {
      if (!data?.pages) return data;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          data: (page.data || []).map((review) =>
            review.id === reviewId ? patch(review) : review
          )
        }))
      };
    }
  );

export interface VoteReviewInput {
  reviewId: number;
  helpful: boolean;
}

interface VoteContext {
  previousLists: Array<[QueryKey, unknown]>;
  previousVotes: VoteMap;
}

/**
 * `POST /reviews/:id/votes`, optimistic. Sends `X-Visitor-Id` (a random id
 * kept in localStorage) and the Bearer token when signed in. Counts update
 * in every cached list right away and settle to the server's numbers.
 */
export const useVoteReview = () => {
  const queryClient = useQueryClient();
  return useMutation<ReviewVoteResult, unknown, VoteReviewInput, VoteContext>(
    ({ reviewId, helpful }) => {
      const visitorId = getVisitorId();
      return dnaFetch<ReviewVoteResult>(
        `/reviews/${encodeURIComponent(String(reviewId))}/votes`,
        {
          method: "POST",
          body: { helpful },
          auth: "optional",
          headers: visitorId ? { "X-Visitor-Id": visitorId } : undefined
        }
      );
    },
    {
      onMutate: async ({ reviewId, helpful }) => {
        await queryClient.cancelQueries(QueryKeys.PRODUCT_REVIEWS);
        const previousLists = queryClient.getQueriesData(
          QueryKeys.PRODUCT_REVIEWS
        );
        const previousVotes =
          queryClient.getQueryData<VoteMap>(votesKey) || readStoredVotes();
        const before = previousVotes[String(reviewId)];
        if (before !== helpful) {
          patchReviewInLists(queryClient, reviewId, (review) => ({
            ...review,
            helpful_count: Math.max(
              0,
              review.helpful_count +
                (helpful ? 1 : 0) -
                (before === true ? 1 : 0)
            ),
            unhelpful_count: Math.max(
              0,
              review.unhelpful_count +
                (helpful ? 0 : 1) -
                (before === false ? 1 : 0)
            )
          }));
        }
        queryClient.setQueryData<VoteMap>(votesKey, {
          ...previousVotes,
          [String(reviewId)]: helpful
        });
        return { previousLists, previousVotes };
      },
      onError: (_error, _input, context) => {
        if (!context) return;
        context.previousLists.forEach(([key, data]) =>
          queryClient.setQueryData(key, data)
        );
        queryClient.setQueryData(votesKey, context.previousVotes);
      },
      onSuccess: (result, { reviewId }) => {
        patchReviewInLists(queryClient, reviewId, (review) => ({
          ...review,
          helpful_count: result.helpful_count,
          unhelpful_count: result.unhelpful_count
        }));
        const votes = {
          ...(queryClient.getQueryData<VoteMap>(votesKey) || {})
        };
        if (result.your_vote === null || result.your_vote === undefined) {
          delete votes[String(reviewId)];
        } else {
          votes[String(reviewId)] = result.your_vote;
        }
        queryClient.setQueryData(votesKey, votes);
        writeStoredVotes(votes);
      }
    }
  );
};

/* Reports ------------------------------------------------------------- */

/** `POST /reports` with a review target. Bearer required. */
export const useReportReview = () =>
  useMutation<{ id: number }, unknown, ReportReviewInput>(
    ({ reviewId, reason, details }) =>
      dnaFetch<{ id: number }>("/reports", {
        method: "POST",
        body: {
          target: { type: "review", id: reviewId },
          reason,
          details: details?.trim() ? details.trim() : undefined
        },
        auth: "required"
      })
  );

/**
 * Shared helpers for the product reviews read path (stars, PDP section,
 * JSON-LD). See docs/plans/2026-11-26-product-reviews-design.md.
 */
import { DnaApiError, isDnaApiError } from "./api/dnaFetch";
import type {
  ProductRatingAttributes,
  ReportReason,
  ReviewStatus,
  RatingHistogram,
  ReviewAttributeSummary,
  ReviewListFilters,
  ReviewScope,
  ReviewSort,
  StarRating
} from "../types/reviews";

/**
 * Ship-dark switch. Everything review-related (stars, section, JSON-LD and
 * the SSR review fetches) renders nothing unless this is exactly "true".
 */
export const REVIEWS_ENABLED =
  process.env.NEXT_PUBLIC_REVIEWS_ENABLED === "true";

/** Page size for the PDP list. SSR prefetches the first page with the same size. */
export const REVIEWS_PER_PAGE = 5;

/** Compliance: the default sort is "Most helpful", never rating-descending. */
export const DEFAULT_REVIEW_SORT: ReviewSort = "helpful";

export const REVIEW_SORT_OPTIONS: Array<{ value: ReviewSort; label: string }> =
  [
    { value: "helpful", label: "Most helpful" },
    { value: "recent", label: "Newest" },
    { value: "rating_desc", label: "Highest rating" },
    { value: "rating_asc", label: "Lowest rating" }
  ];

export const STAR_VALUES: StarRating[] = [5, 4, 3, 2, 1];

export const EMPTY_HISTOGRAM: RatingHistogram = {
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0
};

/** Normalized list filters, so query keys match between SSR and the browser. */
export type NormalizedReviewFilters = Required<ReviewListFilters>;

export const normalizeReviewFilters = (
  filters: ReviewListFilters = {}
): NormalizedReviewFilters => ({
  scope: filters.scope || "retail",
  sort: filters.sort || DEFAULT_REVIEW_SORT,
  rating: [...(filters.rating || [])].sort((a, b) => b - a),
  with_photos: !!filters.with_photos,
  written: !!filters.written,
  per_page: filters.per_page || REVIEWS_PER_PAGE
});

/** The scope a PDP shows by default: retail shoppers see retail reviews, wholesale accounts see all. */
export const defaultReviewScope = (wholesale?: boolean): ReviewScope =>
  wholesale ? "all" : "retail";

const toNumber = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
};

export interface ProductRating {
  average: number;
  count: number;
}

/**
 * Reads the rating that rides along on the storefront v2 product payload.
 * Wholesale mode uses the all-channel pair, falling back to retail when the
 * backend doesn't send it. Returns null when there is nothing to show.
 */
export const getProductRating = (
  attributes: ProductRatingAttributes | Record<string, unknown> | undefined,
  wholesale?: boolean
): ProductRating | null => {
  if (!attributes) return null;
  const attrs = attributes as ProductRatingAttributes;
  const useAll =
    wholesale &&
    attrs.all_reviews_count !== undefined &&
    attrs.all_reviews_count !== null;
  const count = Math.floor(
    toNumber(useAll ? attrs.all_reviews_count : attrs.reviews_count)
  );
  const average = toNumber(useAll ? attrs.all_avg_rating : attrs.avg_rating);
  if (count < 1 || average <= 0) return null;
  return { average, count };
};

/** "4.6" */
export const formatAverage = (value: number): string =>
  (Math.round(value * 10) / 10).toFixed(1);

export const pluralize = (count: number, singular: string, plural?: string) =>
  `${count.toLocaleString("en-US")} ${
    count === 1 ? singular : plural || `${singular}s`
  }`;

/** "Nov 18, 2026". UTC so the server and browser render the same text. */
export const formatReviewDate = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
};

/** Middle label for a bipolar attribute; only fit has a well-known one. */
export const bipolarMidLabel = (attribute: { key: string }): string | null =>
  attribute.key === "fit" ? "True to size" : null;

/**
 * Words for a bipolar value (1–5, 3 is the middle), e.g. "Runs small".
 * Used for a single review's rating and for the PDP average.
 */
export const describeBipolar = (
  attribute: Pick<ReviewAttributeSummary, "key" | "low_label" | "high_label">,
  value: number
): string | null => {
  if (value < 2.75) return attribute.low_label;
  if (value > 3.25) return attribute.high_label;
  return bipolarMidLabel(attribute) || "In the middle";
};

/** Marker position on a bipolar track, 0–100. */
export const bipolarPercent = (value: number): number =>
  Math.min(100, Math.max(0, ((value - 1) / 4) * 100));

/* ------------------------------------------------------------------ */
/* Write path (M2)                                                     */
/* ------------------------------------------------------------------ */

/** localStorage key for the anonymous voter id sent as `X-Visitor-Id`. */
export const VISITOR_ID_KEY = "dna_visitor_id";

/** localStorage key for a composer draft (text fields only). */
export const reviewDraftKey = (productId: string | number) =>
  `dna_review_draft_${productId}`;

const randomId = (): string => {
  const cryptoApi =
    typeof globalThis !== "undefined"
      ? (globalThis.crypto as Crypto | undefined)
      : undefined;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
};

/**
 * A random id for this browser, created once and kept in localStorage, so
 * anonymous helpful votes count once per visitor. Undefined on the server or
 * when storage is blocked.
 */
export const getVisitorId = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;
    const id = randomId();
    window.localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    return undefined;
  }
};

/** Report reasons accepted by `POST /reports`, with customer-facing labels. */
export const REPORT_REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: "spam", label: "Spam or advertising" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate", label: "Hate speech" },
  { value: "sexual", label: "Sexual content" },
  { value: "violence", label: "Violence or threats" },
  { value: "impersonation", label: "Pretending to be someone else" },
  { value: "self_harm", label: "Self-harm" },
  { value: "other", label: "Something else" }
];

/** Labels for the account page badge. Never names a moderation reason. */
export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  published: "Live",
  pending: "Checking",
  rejected: "Not shown",
  hidden: "Not shown"
};

/** Words for a 1–5 `scale` question (e.g. Quality). */
export const SCALE_LABELS = [
  "Poor",
  "Below average",
  "Average",
  "Good",
  "Excellent"
] as const;

/**
 * "+100 points once it's live" / "+100 points added". The same line for
 * every rating; returns null when nothing is due (e.g. an edit).
 */
export const reviewPointsLine = (
  points: { awarded?: number; pending?: number } | null | undefined,
  { isNew = true }: { isNew?: boolean } = {}
): string | null => {
  if (!points) return null;
  const pending = points.pending || 0;
  const awarded = points.awarded || 0;
  if (pending > 0) {
    return `+${pending.toLocaleString("en-US")} points once it's live`;
  }
  if (awarded > 0 && isNew) {
    return `+${awarded.toLocaleString("en-US")} points added`;
  }
  return null;
};

type ReviewErrorContext = "submit" | "vote" | "report" | "delete" | "load";

const errorCode = (error: DnaApiError): string | undefined => {
  const body = error.body as { code?: unknown } | undefined;
  return body && typeof body.code === "string" ? body.code : undefined;
};

const TOO_MANY: Record<ReviewErrorContext, string> = {
  submit:
    "You've sent a lot of reviews in a short time. Please try again in an hour.",
  vote: "You've voted a lot in a short time. Please try again later.",
  report:
    "You've sent a lot of reports in a short time. Please try again later.",
  delete: "Too many requests. Please try again later.",
  load: "Too many requests. Please try again later."
};

/**
 * A customer-facing message for a failed review request. Field errors
 * (422 with `fields`) are shown under each field by the caller; this returns
 * the summary line.
 */
export const reviewErrorMessage = (
  error: unknown,
  context: ReviewErrorContext = "submit"
): string => {
  if (!isDnaApiError(error)) {
    return "Something went wrong. Please try again.";
  }
  const code = errorCode(error);
  if (code === "invalid_token") {
    return "This review link isn't valid any more.";
  }
  if (code === "not_enabled" || error.status === 503) {
    return "Reviews are switched off for a moment. Please try again later.";
  }
  if (code === "not_eligible") {
    return "Reviews are open to customers once their order has shipped.";
  }
  if (code === "forbidden") {
    return "Staff accounts can't review products.";
  }
  switch (error.status) {
    case 0:
      return error.message;
    case 401:
      return "Please sign in again to continue.";
    case 403:
      return "You can't do that with this account.";
    case 404:
      return context === "vote" || context === "report"
        ? "This review isn't available any more."
        : "We couldn't find that review.";
    case 413:
      return "Those photos are too large. Try fewer or smaller photos.";
    case 422:
      if (error.fieldErrors) return "Please check the highlighted fields.";
      if (context === "vote") return "You can't vote on your own review.";
      if (context === "report") return "You can't report your own review.";
      return error.message || "Please check your review and try again.";
    case 429:
      return TOO_MANY[context];
    default:
      return "Something went wrong. Please try again.";
  }
};

/**
 * A write sent with `X-Review-Token` was refused because the link is dead
 * (404 `invalid_token`). A plain 404 on PATCH only means "not your review".
 */
export const isInvalidReviewToken = (error: unknown): boolean =>
  isDnaApiError(error) && errorCode(error) === "invalid_token";

/**
 * `GET /review_requests/:token` failed because the link is dead: unknown,
 * expired, replaced by a newer email, opted out or cancelled (all 404).
 */
export const isInvalidReviewLink = (error: unknown): boolean =>
  isDnaApiError(error) && (error.status === 404 || isInvalidReviewToken(error));

/** True for a 503 / `not_enabled`: reviews are switched off server-side. */
export const isReviewsDisabledError = (error: unknown): boolean =>
  isDnaApiError(error) &&
  (error.status === 503 || errorCode(error) === "not_enabled");

/**
 * Field errors keyed by composer field: `rating`, `title`, `body`,
 * `display_name`, `photos` and `attribute_ratings` (nested keys such as
 * `attribute_ratings.fit` fold into it).
 */
export const reviewFieldErrors = (error: unknown): Record<string, string> => {
  if (!isDnaApiError(error) || !error.fieldErrors) return {};
  const result: Record<string, string> = {};
  Object.keys(error.fieldErrors).forEach((key) => {
    const messages = error.fieldErrors?.[key] || [];
    if (!messages.length) return;
    const field = key.replace(/\[.*$/, "").replace(/\..*$/, "");
    const text = messages.join(" ");
    result[field] = result[field] ? `${result[field]} ${text}` : text;
  });
  return result;
};

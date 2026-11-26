/**
 * Shared helpers for the product reviews read path (stars, PDP section,
 * JSON-LD). See docs/plans/2026-11-26-product-reviews-design.md.
 */
import type {
  ProductRatingAttributes,
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

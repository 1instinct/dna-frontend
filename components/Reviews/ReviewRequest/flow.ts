/**
 * Pure helpers for the email review page (`/review/[token]`): reading the
 * email link's query string, picking the first item, walking the order's
 * items and building the composer's data from the review request.
 */
import type {
  OwnReview,
  ReviewForm,
  ReviewRequestItem,
  ReviewRequestPayload,
  StarRating
} from "../../../types/reviews";

/** What a star tapped in the email asks for: `?item=<line_item_id>&rating=<1-5>`. */
export interface EmailLinkIntent {
  lineItemId: number | null;
  rating: StarRating | null;
}

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** Reads `?item=` and `?rating=`; anything malformed is ignored. */
export const parseEmailLinkIntent = (query: {
  item?: string | string[];
  rating?: string | string[];
}): EmailLinkIntent => {
  const item = Number(first(query.item));
  const rating = Number(first(query.rating));
  return {
    lineItemId: Number.isInteger(item) && item > 0 ? item : null,
    rating:
      Number.isInteger(rating) && rating >= 1 && rating <= 5
        ? (rating as StarRating)
        : null
  };
};

/** True when the link carries the opt-out flag (`?opt_out=1`). */
export const isOptOutLink = (query: { opt_out?: string | string[] }) => {
  const value = first(query.opt_out);
  return value === "1" || value === "true";
};

/** Reviews written on this page, by line item, layered over the API's. */
export type SubmittedReviews = Record<number, OwnReview>;

export const reviewOf = (
  item: ReviewRequestItem,
  submitted: SubmittedReviews
): OwnReview | null =>
  submitted[item.line_item_id] || item.existing_review || null;

export interface StartPoint {
  /** Null when every item already has a review (a completed link). */
  item: ReviewRequestItem | null;
  /** The email's star, only for an item that has no review yet. */
  rating: StarRating | null;
}

/**
 * Where the page opens: the emailed item with its star when that item has
 * no review yet, otherwise the first item without a review.
 */
export const pickStartPoint = (
  items: ReviewRequestItem[],
  intent: EmailLinkIntent
): StartPoint => {
  const emailed = intent.lineItemId
    ? items.find((item) => item.line_item_id === intent.lineItemId)
    : undefined;
  if (emailed && !emailed.existing_review) {
    return { item: emailed, rating: intent.rating };
  }
  return {
    item: items.find((item) => !item.existing_review) || null,
    rating: null
  };
};

/**
 * Items still waiting for a review, in order, starting after `fromId` and
 * wrapping around (an email star can open the page on the second item).
 * Skipped items and `fromId` itself are left out.
 */
export const pendingAfter = (
  items: ReviewRequestItem[],
  fromId: number | null,
  submitted: SubmittedReviews,
  skipped: number[]
): ReviewRequestItem[] => {
  const start = items.findIndex((item) => item.line_item_id === fromId);
  const ordered =
    start < 0
      ? items
      : [...items.slice(start + 1), ...items.slice(0, start + 1)];
  return ordered.filter(
    (item) =>
      item.line_item_id !== fromId &&
      !skipped.includes(item.line_item_id) &&
      !reviewOf(item, submitted)
  );
};

/** "Item 2 of 3" (1-based position in the order). */
export const itemPositionLabel = (
  items: ReviewRequestItem[],
  item: ReviewRequestItem
) =>
  `Item ${
    items.findIndex((entry) => entry.line_item_id === item.line_item_id) + 1
  } of ${items.length}`;

/**
 * The composer's `review_form` data for one item. Guests (no account) get
 * zero points so the composer doesn't promise points they can't collect.
 */
export const composerFormFor = (
  request: ReviewRequestPayload,
  item: ReviewRequestItem,
  existingReview: OwnReview | null
): ReviewForm => ({
  eligible: true,
  reason: null,
  line_item_id: item.line_item_id,
  variant_label: item.variant_label,
  existing_review: existingReview,
  questions: item.questions || [],
  display_name: request.display_name,
  points: request.has_account
    ? request.points
    : { per_review: 0, photo_bonus: 0 },
  limits: request.limits
});

export interface SessionPoints {
  pending: number;
  awarded: number;
}

/**
 * Points from the reviews first written on this page (edits of older
 * reviews earn nothing new). The same for every rating.
 */
export const sessionPoints = (reviews: OwnReview[]): SessionPoints =>
  reviews.reduce(
    (total, review) => ({
      pending: total.pending + (review.points?.pending || 0),
      awarded: total.awarded + (review.points?.awarded || 0)
    }),
    { pending: 0, awarded: 0 }
  );

/** "Maya" from "Maya R.". */
export const firstName = (name: string | null | undefined) =>
  (name || "").trim().split(/\s+/)[0] || "";

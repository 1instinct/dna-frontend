/**
 * Hand-written types for dna-admin's product review, Q&A and store review
 * endpoints (`/api/v1/...`). Keep in sync with the swagger docs in
 * dna-admin's `ApidocsController`. See
 * docs/plans/2026-11-26-product-reviews-design.md ("API").
 */

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

/** Which reviews a list or summary covers. `all`/`wholesale` need a wholesale or admin Bearer token. */
export type ReviewChannelScope = "retail" | "all" | "wholesale";

/** The channel a single review was stamped with. */
export type ReviewChannel = "retail" | "wholesale";

export type ReviewStatus = "pending" | "published" | "rejected" | "hidden";

export type ReviewSource = "email" | "web" | "account" | "app" | "import";

/** Star value, 1–5. */
export type StarRating = 1 | 2 | 3 | 4 | 5;

export type RatingHistogram = Record<"1" | "2" | "3" | "4" | "5", number>;

export interface PaginationMeta {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export interface ReviewPhoto {
  id: number | string;
  thumb_url: string;
  card_url: string;
  full_url: string;
  alt: string | null;
}

export interface ReviewReply {
  body: string;
  replied_at: string;
}

/** `{ [ReviewAttribute#key]: 1..5 }`, e.g. `{ fit: 2, quality: 5 }`. */
export type AttributeRatings = Record<string, number>;

export interface Review {
  id: number;
  rating: StarRating;
  title: string | null;
  body: string | null;
  display_name: string;
  /** "Rose · M"; null when the variant is unknown (imports, store reviews). */
  variant_label: string | null;
  verified_purchase: boolean;
  incentivized: boolean;
  channel: ReviewChannel;
  attribute_ratings: AttributeRatings;
  photos: ReviewPhoto[];
  helpful_count: number;
  unhelpful_count: number;
  reply: ReviewReply | null;
  published_at: string | null;
  edited: boolean;
}

export type ReviewAttributeKind = "scale" | "bipolar";

/** A per-category question shown in the composer (e.g. "Fit"). */
export interface ReviewAttributeDefinition {
  key: string;
  label: string;
  kind: ReviewAttributeKind;
  /** Bipolar only, e.g. "Runs small". */
  low_label: string | null;
  /** Bipolar only, e.g. "Runs large". */
  high_label: string | null;
  position?: number;
}

/** Aggregated attribute bar on the PDP. */
export interface ReviewAttributeSummary {
  key: string;
  label: string;
  kind: ReviewAttributeKind;
  low_label: string | null;
  high_label: string | null;
  average: number | null;
  count: number;
}

export interface AiSummaryPoint {
  label: string;
  mentions: number;
}

export interface AiSummary {
  headline: string;
  summary: string;
  pros: AiSummaryPoint[];
  cons: AiSummaryPoint[];
  fit_consensus: string | null;
  review_count: number;
  generated_at: string;
}

/** A photo in the PDP media strip, linked back to its review. */
export interface ReviewSummaryPhoto extends ReviewPhoto {
  review_id: number;
}

export interface ReviewSummary {
  scope: ReviewChannelScope;
  average: number | null;
  /** All ratings, including star-only reviews. */
  ratings_count: number;
  /** Reviews with written text. */
  reviews_count: number;
  histogram: RatingHistogram;
  photos_count: number;
  attributes: ReviewAttributeSummary[];
  /** Retail scope only; null until generated or when hidden by an admin. */
  ai_summary: AiSummary | null;
  /** Up to 12, `card` variant. */
  latest_photos: ReviewSummaryPhoto[];
}

export type ReviewSort = "helpful" | "recent" | "rating_desc" | "rating_asc";

/** Query for `GET /products/:product_id/reviews`. */
export interface ReviewListParams {
  /** Product id or slug. */
  productId: string | number;
  channel?: ReviewChannelScope;
  sort?: ReviewSort;
  /** Sent as `rating[]=5&rating[]=4`. */
  rating?: StarRating[];
  with_photos?: boolean;
  /** Toolbar "Verified" filter; confirm the param name with M1.1. */
  verified?: boolean;
  page?: number;
  per_page?: number;
}

export interface ReviewVoteInput {
  helpful: boolean;
}

export interface ReviewVoteResult {
  helpful_count: number;
  unhelpful_count: number;
  /** The caller's vote after this request. */
  helpful: boolean | null;
}

/* ------------------------------------------------------------------ */
/* Writing reviews                                                     */
/* ------------------------------------------------------------------ */

export interface ReviewableExistingReview {
  id: number;
  rating: StarRating;
  status: ReviewStatus;
}

/** A purchased (and shipped) line item the customer can review. */
export interface Reviewable {
  line_item_id: number;
  order_number: string;
  product_id: number;
  slug: string;
  name: string;
  image_url: string | null;
  variant_label: string | null;
  existing_review: ReviewableExistingReview | null;
}

export interface ReviewPhotoUpload {
  file: File | Blob;
  alt?: string;
}

/**
 * Body for `POST /reviews` (sent as multipart). Either a Bearer token or an
 * `X-Review-Token` authorizes it.
 */
export interface CreateReviewInput {
  product_id: number | string;
  line_item_id?: number;
  rating: StarRating;
  title?: string;
  body?: string;
  attribute_ratings?: AttributeRatings;
  display_name?: string;
  photos?: ReviewPhotoUpload[];
}

/** Body for `PATCH /reviews/:id` (own review; goes back through moderation). */
export interface UpdateReviewInput
  extends Partial<Omit<CreateReviewInput, "product_id" | "line_item_id">> {
  id: number;
  /** Ids of existing photos to remove. */
  remove_photo_ids?: Array<number | string>;
}

/** A review as its author sees it on `/account/reviews`. */
export interface MyReview extends Review {
  status: ReviewStatus;
  moderation_reason?: string | null;
  product: {
    id: number;
    slug: string;
    name: string;
    image_url: string | null;
  };
}

/* ------------------------------------------------------------------ */
/* Review request (email landing, /review/[token])                     */
/* ------------------------------------------------------------------ */

export type ReviewRequestStatus =
  | "scheduled"
  | "sent"
  | "reminded"
  | "completed"
  | "opted_out"
  | "expired"
  | "cancelled";

export interface ReviewRequestStoreReviewState {
  enabled: boolean;
  existing_review: { id: number; rating: StarRating } | null;
  attributes: ReviewAttributeDefinition[];
}

/** `GET /review_requests/:token`. */
export interface ReviewRequestPayload {
  status: ReviewRequestStatus;
  order_number: string;
  /** Shopper's suggested display name, e.g. "Maya R.". */
  display_name: string | null;
  /** True when the order belongs to an account (points go there). */
  has_account: boolean;
  items: Array<
    Reviewable & {
      /** Composer questions for this product's taxons. */
      attributes?: ReviewAttributeDefinition[];
    }
  >;
  store_review: ReviewRequestStoreReviewState;
  points_per_review: number;
  points_photo_bonus: number;
  expires_at: string | null;
}

/* ------------------------------------------------------------------ */
/* Q&A                                                                 */
/* ------------------------------------------------------------------ */

export interface ProductAnswer {
  id: number;
  body: string;
  display_name: string;
  /** Staff answer. */
  official: boolean;
  verified_buyer: boolean;
  helpful_count: number;
  published_at: string | null;
}

/** Only answered questions are returned publicly. */
export interface ProductQuestion {
  id: number;
  body: string;
  display_name: string;
  answers_count: number;
  answers: ProductAnswer[];
  published_at: string | null;
}

export interface CreateQuestionInput {
  product_id: number | string;
  body: string;
  display_name?: string;
}

/* ------------------------------------------------------------------ */
/* Store reviews                                                       */
/* ------------------------------------------------------------------ */

/** Store reviews reuse the review shape (no variant; attributes are delivery/packaging). */
export type StoreReview = Review;

/** `GET /store_reviews/summary`; same shape as a product summary (retail scope). */
export type StoreReviewSummary = ReviewSummary;

export interface StoreReviewListParams {
  sort?: ReviewSort;
  rating?: StarRating[];
  page?: number;
  per_page?: number;
}

export interface CreateStoreReviewInput {
  rating: StarRating;
  title?: string;
  body?: string;
  attribute_ratings?: AttributeRatings;
  display_name?: string;
}

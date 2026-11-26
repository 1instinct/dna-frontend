/**
 * Hand-written types for dna-admin's product review, Q&A and store review
 * endpoints (`/api/v1/...`). The read path (summary + list) follows
 * docs/plans/2026-11-26-reviews-api-contract.md exactly; keep the rest in
 * sync with the swagger docs in dna-admin's `ApidocsController`.
 */

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

/**
 * Which reviews a list or summary covers (the `scope` query param).
 * `all`/`wholesale` need a wholesale or admin Bearer token, else 403.
 */
export type ReviewChannelScope = "retail" | "all" | "wholesale";
export type ReviewScope = ReviewChannelScope;

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

export interface Paginated<T, M extends PaginationMeta = PaginationMeta> {
  data: T[];
  meta: M;
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
  /** 1–5. For `bipolar`, 3 is the middle ("true to size" for fit). */
  average: number;
  count: number;
}

export interface AiSummaryPoint {
  label: string;
  mentions: number;
}

export type FitConsensus = "runs_small" | "true_to_size" | "runs_large";

/**
 * Always built from retail reviews (`source_scope: "retail"`). The summary
 * endpoint returns it for `scope=retail` and `scope=all` (label it "from
 * retail reviews" there) and `null` for `scope=wholesale`.
 */
export interface AiSummary {
  headline: string;
  summary: string;
  pros: AiSummaryPoint[];
  cons: AiSummaryPoint[];
  fit_consensus: FitConsensus | null;
  review_count: number;
  generated_at: string;
  source_scope: "retail";
}

/** A photo in the PDP media strip, linked back to its review. */
export interface ReviewSummaryPhoto extends ReviewPhoto {
  review_id: number;
}

/** `GET /products/:product_id/review_summary?scope=`. Zeros when there are no reviews. */
export interface ReviewSummary {
  /** The scope actually served. */
  scope: ReviewChannelScope;
  /** 0 when there are no ratings. */
  average: number;
  /** All ratings, including star-only reviews. */
  ratings_count: number;
  /** Reviews with written text. */
  reviews_count: number;
  photos_count: number;
  /** All five keys are always present. */
  histogram: RatingHistogram;
  /** Active questions for this product in admin order, only those with `count > 0`. */
  attributes: ReviewAttributeSummary[];
  /** Null until generated (M7), when hidden by an admin, and for `scope=wholesale`. */
  ai_summary: AiSummary | null;
  /** At most 12 photos from published reviews in the scope, newest first. */
  latest_photos: ReviewSummaryPhoto[];
}

export type ReviewSort = "helpful" | "recent" | "rating_desc" | "rating_asc";

/** Filters for `GET /products/:product_id/reviews` (everything but the page). */
export interface ReviewListFilters {
  /** Default `retail`. */
  scope?: ReviewChannelScope;
  /** Default `helpful`. Never default to `rating_desc`. */
  sort?: ReviewSort;
  /** Sent as `rating[]=5&rating[]=4`. */
  rating?: StarRating[];
  /** Sent as `with_photos=1`. */
  with_photos?: boolean;
  /** Reviews with text only; sent as `written=1`. */
  written?: boolean;
  /** 1–50, default 10 on the server. */
  per_page?: number;
}

/** Query for `GET /products/:product_id/reviews`. */
export interface ReviewListParams extends ReviewListFilters {
  /** Product id or slug. */
  productId: string | number;
  page?: number;
}

export interface ReviewListMeta extends PaginationMeta {
  scope: ReviewChannelScope;
}

/** `GET /products/:product_id/reviews` response. */
export type ReviewListResponse = Paginated<Review, ReviewListMeta>;

/**
 * Rating attributes on the storefront v2 product payload
 * (`data.attributes`). Averages are decimal strings, e.g. `"4.6"`.
 * Use the `all_*` pair in wholesale mode.
 */
export interface ProductRatingAttributes {
  avg_rating?: string | number | null;
  reviews_count?: number | null;
  all_avg_rating?: string | number | null;
  all_reviews_count?: number | null;
}

export interface ReviewVoteInput {
  helpful: boolean;
}

/** `POST /reviews/:id/votes` response. */
export interface ReviewVoteResult {
  helpful_count: number;
  unhelpful_count: number;
  /** The caller's vote after this request. */
  your_vote: boolean | null;
}

/* ------------------------------------------------------------------ */
/* Writing reviews (M2, see "M2 write path" in the API contract)       */
/* ------------------------------------------------------------------ */

/** Error `code` on write endpoints (403/422/503). */
export type ReviewErrorCode =
  | "not_eligible"
  | "forbidden"
  | "not_enabled"
  | "invalid";

/** Points for one review. Same amounts for every rating (FTC: sentiment-blind). */
export interface ReviewPoints {
  /** Already paid for this review. */
  awarded: number;
  /** Still due once published (50, +50 with photos), or 0. */
  pending: number;
}

/** Point settings shown before writing ("50 points, +50 with a photo"). */
export interface ReviewPointSettings {
  per_review: number;
  photo_bonus: number;
}

export interface ReviewProductRef {
  id: number;
  slug: string;
  name: string;
  image_url: string | null;
}

/**
 * A review as its author sees it: the public shape plus status, a
 * customer-facing status message (never a moderation reason), the product
 * and points. `published_at` is null until published.
 */
export interface OwnReview extends Review {
  status: ReviewStatus;
  status_message: string;
  product: ReviewProductRef;
  points: ReviewPoints;
}

/** Kept for older imports. */
export type MyReview = OwnReview;

/** Composer question; same shape as an attribute definition. */
export type ReviewQuestion = ReviewAttributeDefinition;

export interface ReviewFormLimits {
  max_photos: number;
  max_photo_mb: number;
  title_max: number;
  body_max: number;
  /** MIME types the API accepts, e.g. image/jpeg, image/heic. */
  photo_types: string[];
}

export type ReviewIneligibleReason = "not_purchased" | "not_shipped" | "staff";

/** `GET /products/:product_id/review_form` (Bearer). Always 200. */
export interface ReviewForm {
  eligible: boolean;
  reason: ReviewIneligibleReason | null;
  line_item_id: number | null;
  variant_label: string | null;
  existing_review: OwnReview | null;
  questions: ReviewQuestion[];
  /** Suggested display name, e.g. "Maya R.". */
  display_name: string | null;
  points: ReviewPointSettings;
  limits: ReviewFormLimits;
}

export interface ReviewableExistingReview {
  id: number;
  rating: StarRating;
  status: ReviewStatus;
}

/** A received product the customer can review (one entry per product). */
export interface Reviewable {
  line_item_id: number;
  order_number: string;
  product_id: number;
  slug: string;
  name: string;
  image_url: string | null;
  variant_label: string | null;
  purchased_at?: string | null;
  existing_review: ReviewableExistingReview | null;
  questions?: ReviewQuestion[];
}

/** `GET /account/reviewables`, newest purchase first. */
export interface ReviewablesResponse {
  data: Reviewable[];
  points?: ReviewPointSettings;
}

/** `GET /account/reviews`, newest first, any status. */
export type MyReviewsResponse = Paginated<OwnReview>;

/** `POST /reviews` and `PATCH /reviews/:id` response. */
export interface ReviewMutationResponse {
  review: OwnReview;
}

/**
 * Body for `POST /reviews` (sent as multipart). A Bearer token (or, from
 * M4, an `X-Review-Token`) authorizes it. Posting again for a product the
 * customer already reviewed edits that review (200).
 */
export interface CreateReviewInput {
  product_id: number | string;
  line_item_id?: number | null;
  rating: StarRating;
  title?: string;
  body?: string;
  /** Sent as `attribute_ratings[fit]=2`. */
  attribute_ratings?: AttributeRatings;
  display_name?: string;
  /** Sent as `photos[]`; already resized by the composer. */
  photos?: Array<File | Blob>;
}

/** Body for `PATCH /reviews/:id` (own review; goes back through moderation). */
export interface UpdateReviewInput
  extends Partial<Omit<CreateReviewInput, "product_id" | "line_item_id">> {
  id: number;
  /** Ids of existing photos to remove (`photos[].id`). */
  remove_photo_ids?: Array<number | string>;
}

export type ReportReason =
  | "spam"
  | "harassment"
  | "hate"
  | "sexual"
  | "violence"
  | "impersonation"
  | "self_harm"
  | "other";

/** `POST /reports` body for a review. */
export interface ReportReviewInput {
  reviewId: number;
  reason: ReportReason;
  details?: string;
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

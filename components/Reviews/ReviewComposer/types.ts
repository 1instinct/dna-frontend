import type {
  AttributeRatings,
  Reviewable,
  StarRating
} from "../../../types/reviews";

/** What the composer is reviewing. */
export interface ReviewTarget {
  /** Product slug (preferred) or id. Used for the API and the draft key. */
  productId: string | number;
  name?: string | null;
  imageUrl?: string | null;
  variantLabel?: string | null;
  /** Which purchase the review is for, when the entry point knows it. */
  lineItemId?: number | null;
}

export type ComposerStep = 0 | 1 | 2 | 3;

export const STEP_NAMES = ["Rating", "Details", "Photos", "Done"] as const;

export interface ComposerText {
  title: string;
  body: string;
  displayName: string;
}

export interface ComposerValues extends ComposerText {
  rating: StarRating | 0;
  attributeRatings: AttributeRatings;
}

export type ComposerFieldErrors = Partial<
  Record<
    | "rating"
    | "title"
    | "body"
    | "display_name"
    | "attribute_ratings"
    | "photos",
    string
  >
>;

/** What "Next up" shows: any item with a name, image and variant. */
export type ComposerNextItem = Pick<
  Reviewable,
  "name" | "image_url" | "variant_label"
>;

/** A caller-controlled list of items to review one after another. */
export interface ComposerQueue {
  /** Shown on the Done step with "Review next item"; null when nothing is left. */
  next: ComposerNextItem | null;
  /** Items still to review after this one. */
  remaining: number;
  /** Replaces "N to review" on the Done step, e.g. "Item 2 of 3". */
  nextLabel?: string;
  onNext: () => void;
}

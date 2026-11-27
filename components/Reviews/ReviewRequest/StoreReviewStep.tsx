import React, { useMemo } from "react";
import { isInvalidReviewToken } from "@lib/reviews";
import type {
  OwnStoreReview,
  ReviewRequestPayload,
  ReviewRequestStoreReview
} from "../../../types/reviews";
import { StoreReviewComposer } from "../StoreReviews/StoreReviewComposer";
import type { StoreReviewStepProps } from "./ReviewRequestFlow";

export interface StoreReviewStepFullProps extends StoreReviewStepProps {
  /** The store review for this order so far (from the API or this visit). */
  existingReview?: OwnStoreReview | ReviewRequestStoreReview | null;
  onSubmitted?: (review: OwnStoreReview) => void;
  /** A write came back `invalid_token`: show the expired-link page. */
  onLinkDead?: () => void;
  /** Focus the step heading on mount (only after the shopper has acted). */
  autoFocus?: boolean;
}

const storeForm = (
  request: ReviewRequestPayload,
  existingReview: StoreReviewStepFullProps["existingReview"]
) => ({
  display_name: request.display_name,
  // The M4 payload has no store questions yet; stars and text only.
  questions: request.store_review.questions || [],
  existing_review:
    existingReview === undefined
      ? request.store_review.existing_review
      : existingReview,
  limits: request.limits
});

/**
 * "How was shopping with us?" after the order's items on `/review/[token]`.
 * Posts to `/store_reviews` with `X-Review-Token` (PATCH for this order's
 * existing store review, or after a 409). Skippable, and no points copy:
 * store reviews earn none.
 */
export const StoreReviewStep = ({
  token,
  request,
  onDone,
  existingReview,
  onSubmitted,
  onLinkDead,
  autoFocus = false
}: StoreReviewStepFullProps) => {
  const form = useMemo(
    () => storeForm(request, existingReview),
    // The composer reads the form once; keep it stable for this visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <section aria-label="Review the store" className="grid gap-3">
      <StoreReviewComposer
        form={form}
        mode="page"
        reviewToken={token}
        // Only true after the shopper acts, never on page load.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        onSkip={onDone}
        onContinue={onDone}
        onSubmitted={onSubmitted}
        onError={(error) => {
          if (isInvalidReviewToken(error)) onLinkDead?.();
        }}
      />
    </section>
  );
};

export default StoreReviewStep;

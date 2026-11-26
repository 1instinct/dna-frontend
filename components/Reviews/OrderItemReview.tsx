import React, { useState } from "react";
import { PenLine } from "lucide-react";
import { Button, Rating } from "@components/ui";
import { cn } from "@lib/utils";
import { REVIEWS_ENABLED } from "@lib/reviews";
import { useReviewables } from "@hooks/useReviews";
import type { Reviewable } from "../../types/reviews";
import { ReviewComposerSheet } from "./ReviewComposer";
import type { ReviewTarget } from "./ReviewComposer";

interface OrderItemReviewProps {
  /** Spree line item id. */
  lineItemId: string | number;
  /** Product slug from the line item, for a reviewable from another order. */
  slug?: string | null;
  className?: string;
}

export const reviewTargetFromReviewable = (item: Reviewable): ReviewTarget => ({
  productId: item.slug || item.product_id,
  name: item.name,
  imageUrl: item.image_url,
  variantLabel: item.variant_label,
  lineItemId: item.line_item_id
});

/** Finds the reviewable for an order line: by line item, then by product. */
export const findReviewable = (
  items: Reviewable[] | undefined,
  lineItemId: string | number,
  slug?: string | null
) =>
  (items || []).find(
    (item) => String(item.line_item_id) === String(lineItemId)
  ) || (slug ? (items || []).find((item) => item.slug === slug) : undefined);

/**
 * Order detail line item: "Write a review", or small stars plus "Edit your
 * review" once reviewed. Driven by `/account/reviewables`, so it only shows
 * for shipped items the customer can review.
 */
export const OrderItemReview = ({
  lineItemId,
  slug,
  className
}: OrderItemReviewProps) => {
  const [open, setOpen] = useState(false);
  const reviewables = useReviewables({ enabled: REVIEWS_ENABLED });
  const item = findReviewable(reviewables.data?.data, lineItemId, slug);
  if (!REVIEWS_ENABLED || !item) return null;
  const existing = item.existing_review;

  return (
    <div className={cn("mt-1 flex flex-wrap items-center gap-3", className)}>
      {existing && (
        <Rating
          value={existing.rating}
          size="sm"
          label={`You rated it ${existing.rating} out of 5`}
        />
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${existing ? "Edit your review" : "Write a review"} of ${
          item.name
        }`}
        className="min-h-[44px] gap-1.5 rounded-full border-foreground/30 px-4 font-title text-[11px] uppercase tracking-[0.12em]"
      >
        <PenLine aria-hidden="true" />
        {existing ? "Edit your review" : "Write a review"}
      </Button>
      <ReviewComposerSheet
        open={open}
        onOpenChange={setOpen}
        target={reviewTargetFromReviewable(item)}
      />
    </div>
  );
};

export default OrderItemReview;

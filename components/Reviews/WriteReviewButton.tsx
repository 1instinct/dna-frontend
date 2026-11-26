import React, { useState } from "react";
import { PenLine } from "lucide-react";
import { Button } from "@components/ui";
import { cn } from "@lib/utils";
import { REVIEWS_ENABLED } from "@lib/reviews";
import { useReviewForm, useReviewUserId } from "@hooks/useReviews";
import { ReviewComposerSheet } from "./ReviewComposer";

interface WriteReviewButtonProps {
  /** Product slug (or id); the same value the PDP uses for its review queries. */
  productId: string | number | undefined;
  productName?: string;
  imageUrl?: string | null;
  size?: "sm" | "md";
  className?: string;
}

/**
 * "Write a review" / "Edit your review" on the PDP. Only signed-in customers
 * whose `review_form` says they can review see it; signed-out shoppers see
 * nothing (no login push for reviews from the product page).
 */
export const WriteReviewButton = ({
  productId,
  productName,
  imageUrl,
  size = "md",
  className
}: WriteReviewButtonProps) => {
  const userId = useReviewUserId();
  const [open, setOpen] = useState(false);
  const formQuery = useReviewForm(productId, {
    enabled: REVIEWS_ENABLED && !!userId
  });
  const form = formQuery.data;

  if (!REVIEWS_ENABLED || !userId || !productId || !form) return null;
  const existing = form.existing_review;
  if (!form.eligible && !existing) return null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "min-h-[44px] gap-2 rounded-full border-foreground/30 font-title text-xs uppercase tracking-[0.12em]",
          size === "sm" ? "px-4" : "px-5",
          className
        )}
      >
        <PenLine aria-hidden="true" />
        {existing ? "Edit your review" : "Write a review"}
      </Button>
      <ReviewComposerSheet
        open={open}
        onOpenChange={setOpen}
        target={{
          productId,
          name: productName || existing?.product?.name,
          imageUrl: imageUrl || existing?.product?.image_url,
          variantLabel: form.variant_label,
          lineItemId: form.line_item_id
        }}
      />
    </>
  );
};

export default WriteReviewButton;

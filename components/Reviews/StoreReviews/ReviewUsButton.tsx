import React, { useState } from "react";
import { PenLine } from "lucide-react";
import { Button } from "@components/ui";
import { cn } from "@lib/utils";
import { REVIEWS_ENABLED } from "@lib/reviews";
import { useReviewUserId } from "@hooks/useReviews";
import { useStoreReviewForm } from "@hooks/useStoreReviews";
import { StoreReviewComposerSheet } from "./StoreReviewComposerSheet";

interface ReviewUsButtonProps {
  className?: string;
}

/**
 * "Review us" / "Edit your review" on `/reviews`. Only signed-in customers
 * with a shipped order (or an existing store review) see it.
 */
export const ReviewUsButton = ({ className }: ReviewUsButtonProps) => {
  const userId = useReviewUserId();
  const [open, setOpen] = useState(false);
  const formQuery = useStoreReviewForm({ enabled: !!userId });
  const form = formQuery.data;

  if (!REVIEWS_ENABLED || !userId || !form) return null;
  const existing = form.existing_review;
  if (!form.eligible && !existing) return null;

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "min-h-[44px] gap-2 rounded-full px-5 font-title text-xs uppercase tracking-[0.12em] text-black",
          className
        )}
      >
        <PenLine aria-hidden="true" />
        {existing ? "Edit your review" : "Review us"}
      </Button>
      <StoreReviewComposerSheet
        open={open}
        onOpenChange={setOpen}
        form={form}
      />
    </>
  );
};

export default ReviewUsButton;

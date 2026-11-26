import React from "react";
import { Rating } from "@components/ui";
import { reviewPointsLine } from "@lib/reviews";
import type { OwnReview, Reviewable } from "../../../types/reviews";
import { ProductThumb } from "./ProductThumb";

interface StepDoneProps {
  review: OwnReview;
  isNew: boolean;
  next: Reviewable | null;
  remaining: number;
}

/**
 * Step 4: the API's status message, the stars and the points line. The copy
 * is the same for every rating (FTC: rewards never depend on sentiment).
 */
export const StepDone = ({ review, isNew, next, remaining }: StepDoneProps) => {
  const points = reviewPointsLine(review.points, { isNew });
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <Rating value={review.rating} size="lg" />
      <p className="m-0 max-w-xs font-body text-base text-foreground">
        {review.status_message}
      </p>
      {points && (
        <div className="grid gap-1">
          <p className="m-0 font-title text-2xl tabular-nums text-brand-dark">
            {points}
          </p>
          <p className="m-0 font-body text-xs text-muted-foreground">
            Points are the same whatever you rate.
          </p>
        </div>
      )}
      {next && (
        <div className="mt-2 grid w-full gap-2 rounded-xl border border-border p-3 text-left">
          <span className="font-title text-[11px] leading-4 uppercase tracking-[0.15em] text-muted-foreground">
            Next up{remaining > 1 ? ` · ${remaining} to review` : ""}
          </span>
          <ProductThumb
            name={next.name}
            imageUrl={next.image_url}
            detail={next.variant_label}
          />
        </div>
      )}
    </div>
  );
};

export default StepDone;

import React from "react";
import { RatingInput } from "@components/ui";
import type { ReviewPointSettings } from "../../../types/reviews";

interface StepRatingProps {
  headingId: string;
  rating: number;
  onRating: (value: number) => void;
  error?: string;
  points?: ReviewPointSettings | null;
}

/** Step 1: five large stars with word labels. A rating alone is a review. */
export const StepRating = ({
  headingId,
  rating,
  onRating,
  error,
  points
}: StepRatingProps) => {
  const errorId = `${headingId}-error`;
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <RatingInput
        value={rating}
        onChange={onRating}
        size="lg"
        required
        aria-labelledby={headingId}
        aria-describedby={error ? errorId : undefined}
        className="items-center [&>span]:mt-1 [&>span]:font-title [&>span]:text-xs [&>span]:uppercase [&>span]:tracking-[0.14em] [&>span]:text-brand-dark"
      />
      {error && (
        <p id={errorId} className="m-0 font-body text-sm text-red">
          {error}
        </p>
      )}
      <p className="m-0 max-w-xs font-body text-sm text-muted-foreground">
        You can stop after the stars. A rating alone counts.
      </p>
      {points && points.per_review > 0 && (
        <p className="m-0 max-w-xs font-body text-xs text-muted-foreground">
          A review earns {points.per_review} points once it&apos;s live
          {points.photo_bonus > 0 &&
            `, plus ${points.photo_bonus} with a photo`}
          . The same for every rating.
        </p>
      )}
    </div>
  );
};

export default StepRating;

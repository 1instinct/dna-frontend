import React, { useId } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@components/ui";
import { cn } from "@lib/utils";
import { REVIEW_SORT_OPTIONS } from "@lib/reviews";
import type { ReviewSort, StarRating } from "../../types/reviews";

const chipClass = (pressed: boolean) =>
  cn(
    "inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-3 py-1 font-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    pressed
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-background text-foreground hover:border-foreground/60"
  );

interface FilterChipProps {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const FilterChip = ({ pressed, onClick, children }: FilterChipProps) => (
  <button
    type="button"
    aria-pressed={pressed}
    onClick={onClick}
    className={chipClass(pressed)}
  >
    {children}
  </button>
);

interface ReviewsToolbarProps {
  withPhotos: boolean;
  onWithPhotos: (value: boolean) => void;
  written: boolean;
  onWritten: (value: boolean) => void;
  /** Only shown on wholesale PDPs. */
  showWholesaleFilter: boolean;
  wholesaleOnly: boolean;
  onWholesaleOnly: (value: boolean) => void;
  rating: StarRating | null;
  onClearRating: () => void;
  sort: ReviewSort;
  onSort: (sort: ReviewSort) => void;
}

export const ReviewsToolbar = ({
  withPhotos,
  onWithPhotos,
  written,
  onWritten,
  showWholesaleFilter,
  wholesaleOnly,
  onWholesaleOnly,
  rating,
  onClearRating,
  sort,
  onSort
}: ReviewsToolbarProps) => {
  const sortLabelId = useId();
  const sortTriggerId = useId();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5">
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter reviews"
      >
        <FilterChip
          pressed={withPhotos}
          onClick={() => onWithPhotos(!withPhotos)}
        >
          With photos
        </FilterChip>
        <FilterChip pressed={written} onClick={() => onWritten(!written)}>
          Written only
        </FilterChip>
        {showWholesaleFilter && (
          <FilterChip
            pressed={wholesaleOnly}
            onClick={() => onWholesaleOnly(!wholesaleOnly)}
          >
            Wholesale only
          </FilterChip>
        )}
        {rating && (
          <button
            type="button"
            onClick={onClearRating}
            className={chipClass(true)}
            aria-label={`Showing ${rating}-star reviews only. Clear star filter`}
          >
            {rating}★ only
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span
          id={sortLabelId}
          className="font-body text-sm text-muted-foreground"
        >
          Sort
        </span>
        <Select value={sort} onValueChange={(v) => onSort(v as ReviewSort)}>
          <SelectTrigger
            id={sortTriggerId}
            aria-labelledby={`${sortLabelId} ${sortTriggerId}`}
            className="h-9 w-[168px] rounded-full border border-solid border-border px-3 py-1 text-xs focus:border-foreground"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REVIEW_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReviewsToolbar;

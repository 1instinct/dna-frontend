import React from "react";
import { Rating } from "@components/ui";
import { cn } from "@lib/utils";
import {
  bipolarMidLabel,
  bipolarPercent,
  describeBipolar,
  EMPTY_HISTOGRAM,
  formatAverage,
  pluralize,
  STAR_VALUES
} from "@lib/reviews";
import type {
  ReviewAttributeSummary,
  ReviewSummary,
  StarRating
} from "../../types/reviews";

interface RatingHistogramProps {
  summary: ReviewSummary;
  activeRating: StarRating | null;
  onSelectRating: (rating: StarRating | null) => void;
}

/** Big average, stars, counts and the histogram; each row is a filter toggle. */
export const RatingOverview = ({
  summary,
  activeRating,
  onSelectRating
}: RatingHistogramProps) => {
  const histogram = { ...EMPTY_HISTOGRAM, ...summary.histogram };
  const total = summary.ratings_count || 0;

  return (
    <div className="grid gap-1.5">
      <div className="font-title text-[56px] font-normal leading-none tabular-nums text-foreground">
        {formatAverage(summary.average || 0)}
      </div>
      <Rating value={summary.average || 0} size="md" />
      <p className="m-0 font-body text-sm tabular-nums text-muted-foreground">
        {pluralize(total, "rating")} ·{" "}
        {pluralize(summary.reviews_count || 0, "written review")}
      </p>
      <div
        className="mt-2.5 grid gap-1"
        role="group"
        aria-label="Filter reviews by star rating"
      >
        {STAR_VALUES.map((star) => {
          const count = histogram[String(star) as keyof typeof histogram] || 0;
          const percent = total ? (count / total) * 100 : 0;
          const pressed = activeRating === star;
          return (
            <button
              key={star}
              type="button"
              aria-pressed={pressed}
              aria-label={`Show only ${star}-star reviews (${count})`}
              onClick={() => onSelectRating(pressed ? null : star)}
              className={cn(
                "grid grid-cols-[28px_minmax(0,1fr)_40px] items-center gap-2.5 rounded-md px-1.5 py-1 text-left font-body text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                pressed && "bg-brand/15 hover:bg-brand/20"
              )}
            >
              <span className="font-title text-muted-foreground">{star}★</span>
              <span className="h-2 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${percent.toFixed(1)}%` }}
                />
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {count.toLocaleString("en-US")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AttributeBar = ({ attribute }: { attribute: ReviewAttributeSummary }) => {
  const average = attribute.average || 0;
  const labelClass =
    "font-title text-[11px] uppercase tracking-widest text-muted-foreground";

  if (attribute.kind === "bipolar") {
    const mid = bipolarMidLabel(attribute);
    const description = describeBipolar(attribute, average);
    return (
      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className={labelClass}>{attribute.label}</span>
          <span className="font-body text-muted-foreground">{description}</span>
        </div>
        <span className="sr-only">
          {`${attribute.label}: ${description}, average ${formatAverage(
            average
          )} on a scale from ${attribute.low_label || 1} (1) to ${
            attribute.high_label || 5
          } (5), from ${pluralize(attribute.count, "rating")}.`}
        </span>
        <div className="relative h-2 rounded-full bg-muted" aria-hidden="true">
          <span className="absolute -bottom-[3px] -top-[3px] left-1/2 w-px bg-gray-medium" />
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-background bg-brand shadow-[0_0_0_1px_#EB8B8B]"
            style={{ left: `${bipolarPercent(average)}%` }}
          />
        </div>
        <div
          className="flex justify-between gap-2 font-body text-xs text-muted-foreground"
          aria-hidden="true"
        >
          <span>{attribute.low_label}</span>
          {mid && <span>{mid}</span>}
          <span className="text-right">{attribute.high_label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className={labelClass}>{attribute.label}</span>
        <span className="font-body tabular-nums text-muted-foreground">
          {formatAverage(average)} / 5
        </span>
      </div>
      <span className="sr-only">
        {`${attribute.label}: ${formatAverage(
          average
        )} out of 5 from ${pluralize(attribute.count, "rating")}.`}
      </span>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${Math.min(100, (average / 5) * 100)}%` }}
        />
      </div>
    </div>
  );
};

export const AttributeBars = ({
  attributes
}: {
  attributes: ReviewAttributeSummary[];
}) => {
  if (!attributes.length) return null;
  return (
    <div className="grid content-start gap-5">
      {attributes.map((attribute) => (
        <AttributeBar key={attribute.key} attribute={attribute} />
      ))}
    </div>
  );
};

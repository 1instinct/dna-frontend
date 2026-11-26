import React from "react";
import { Rating } from "@components/ui";
import { cn } from "@lib/utils";
import {
  formatAverage,
  getProductRating,
  pluralize,
  REVIEWS_ENABLED
} from "@lib/reviews";
import type { ProductRatingAttributes } from "../../types/reviews";

export const REVIEWS_SECTION_ID = "reviews";

/** Smooth-scrolls to the reviews section and moves focus to its heading. */
export const scrollToReviews = (event?: React.MouseEvent) => {
  if (typeof document === "undefined") return;
  const target = document.getElementById(REVIEWS_SECTION_ID);
  if (!target) return;
  event?.preventDefault();
  const reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start"
  });
  const heading = target.querySelector<HTMLElement>("[data-reviews-heading]");
  heading?.focus({ preventScroll: true });
  if (window.history?.replaceState) {
    window.history.replaceState(
      window.history.state,
      "",
      `#${REVIEWS_SECTION_ID}`
    );
  }
};

interface RatingSummaryProps {
  /** `data.attributes` of the storefront v2 product. */
  attributes?: ProductRatingAttributes | Record<string, unknown>;
  /** Wholesale mode reads the all-channel `all_*` pair. */
  wholesale?: boolean;
  className?: string;
}

/**
 * "★★★★½ 4.6 · 128 reviews" under the PDP title. Reads the rating that rides
 * on the product payload, so it costs no extra request. Renders nothing at 0
 * ratings or while reviews are switched off.
 */
export const RatingSummary = ({
  attributes,
  wholesale,
  className
}: RatingSummaryProps) => {
  if (!REVIEWS_ENABLED) return null;
  const rating = getProductRating(attributes, wholesale);
  if (!rating) return null;
  const average = formatAverage(rating.average);
  const countLabel = pluralize(rating.count, "review");

  return (
    <a
      href={`#${REVIEWS_SECTION_ID}`}
      onClick={scrollToReviews}
      className={cn(
        "group mt-2 inline-flex flex-wrap items-center gap-2 rounded-sm font-body text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        className
      )}
      aria-label={`Rated ${average} out of 5, ${countLabel}. Go to reviews`}
    >
      <Rating value={rating.average} size="sm" />
      <span className="font-title text-foreground tabular-nums">{average}</span>
      <span aria-hidden="true">·</span>
      <span className="tabular-nums underline-offset-4 group-hover:underline">
        {countLabel}
      </span>
    </a>
  );
};

export default RatingSummary;

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
import { WriteReviewButton } from "./WriteReviewButton";

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
  /**
   * Product slug (or id). When set, eligible signed-in customers also get a
   * "Write a review" / "Edit your review" button here.
   */
  productId?: string | number;
  productName?: string;
  align?: "start" | "center";
  className?: string;
}

/**
 * "★★★★½ 4.6 · 128 reviews" under the PDP title. Reads the rating that rides
 * on the product payload, so it costs no extra request. The stars are hidden
 * at 0 ratings; the write button (signed-in, eligible) still shows. Renders
 * nothing while reviews are switched off.
 */
export const RatingSummary = ({
  attributes,
  wholesale,
  productId,
  productName,
  align = "start",
  className
}: RatingSummaryProps) => {
  if (!REVIEWS_ENABLED) return null;
  const rating = getProductRating(attributes, wholesale);
  if (!rating && !productId) return null;

  const stars = rating ? (
    <a
      href={`#${REVIEWS_SECTION_ID}`}
      onClick={scrollToReviews}
      className="group inline-flex flex-wrap items-center gap-2 rounded-sm font-body text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      aria-label={`Rated ${formatAverage(rating.average)} out of 5, ${pluralize(
        rating.count,
        "review"
      )}. Go to reviews`}
    >
      <Rating value={rating.average} size="sm" />
      <span className="font-title text-foreground tabular-nums">
        {formatAverage(rating.average)}
      </span>
      <span aria-hidden="true">·</span>
      <span className="tabular-nums underline-offset-4 group-hover:underline">
        {pluralize(rating.count, "review")}
      </span>
    </a>
  ) : null;

  if (!productId) {
    return stars ? (
      <div className={cn("mt-2 flex", className)}>{stars}</div>
    ) : null;
  }

  return (
    <RatingSummaryRow align={align} className={className}>
      {stars}
      <WriteReviewButton
        productId={productId}
        productName={productName}
        size="sm"
      />
    </RatingSummaryRow>
  );
};

/** Collapses to nothing when neither the stars nor the button render. */
const RatingSummaryRow = ({
  align,
  className,
  children
}: {
  align: "start" | "center";
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 empty:hidden",
      align === "center" && "justify-center",
      className
    )}
  >
    {children}
  </div>
);

export default RatingSummary;

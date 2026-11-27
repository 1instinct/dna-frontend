import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@lib/utils";
import { formatAverage, pluralize, REVIEWS_ENABLED } from "@lib/reviews";
import { useStoreReviewSummary } from "@hooks/useStoreReviews";

/** True once the element is within ~one screen of the viewport. */
const useNearViewport = (ref: React.RefObject<HTMLElement>) => {
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (near) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, near]);
  return near;
};

interface StoreRatingBadgeProps {
  className?: string;
}

/**
 * `★ 4.8 · 1,203 reviews` linking to `/reviews`, for the footer. Fetches the
 * store summary only when the footer comes near the viewport (the page on
 * `/reviews` already has it cached). Renders nothing while reviews are off,
 * on errors (including 503 `not_enabled`) and at 0 ratings.
 */
export const StoreRatingBadge = (props: StoreRatingBadgeProps) => {
  if (!REVIEWS_ENABLED) return null;
  return <StoreRatingBadgeInner {...props} />;
};

const StoreRatingBadgeInner = ({ className }: StoreRatingBadgeProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);
  const { data } = useStoreReviewSummary({ enabled: near });
  const count = data?.ratings_count || 0;
  const average = data?.average || 0;
  const show = count > 0 && average > 0;

  return (
    // The wrapper stays (empty, no spacing) while hidden so the observer can see it.
    <div
      ref={ref}
      className={cn("flex min-h-[1px] justify-center", show && className)}
    >
      {show && (
        <Link
          href="/reviews"
          data-store-rating-badge
          aria-label={`Rated ${formatAverage(
            average
          )} out of 5 from ${pluralize(
            count,
            "review"
          )}. Read customer reviews`}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 font-title text-xs uppercase tracking-[0.12em] text-gray-medium no-underline transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Star
            className="h-3.5 w-3.5 fill-brand text-brand"
            aria-hidden="true"
          />
          <span className="tabular-nums text-foreground">
            {formatAverage(average)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{pluralize(count, "review")}</span>
        </Link>
      )}
    </div>
  );
};

export default StoreRatingBadge;

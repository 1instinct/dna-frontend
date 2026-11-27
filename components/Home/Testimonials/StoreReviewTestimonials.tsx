import React, { useMemo } from "react";
import Link from "next/link";
import { pluralize, REVIEWS_ENABLED } from "@lib/reviews";
import { useStoreReviews, useStoreReviewSummary } from "@hooks/useStoreReviews";
import type { StarRating } from "../../../types/reviews";
import { Testimonial, TestimonialsView } from "./TestimonialsView";

/**
 * Picking only 4★ and 5★ reviews for a homepage carousel is a marketing
 * choice, so the section says so and links to `/reviews`, where every
 * rating is shown.
 */
const TESTIMONIAL_RATINGS: StarRating[] = [5, 4];
const DEFAULT_LIMIT = 9;
const MAX_TEXT = 280;

const clip = (text: string) =>
  text.length > MAX_TEXT
    ? `${text.slice(0, MAX_TEXT).replace(/\s+\S*$/, "")}…`
    : text;

interface StoreReviewTestimonialsProps {
  title?: string | null;
  content?: string;
  displayStyle?: "carousel" | "grid";
  limit?: number;
}

/**
 * Homepage testimonials from store reviews (`source: "store_reviews"`): the
 * latest written 5★/4★ store reviews. Renders nothing while reviews are off
 * (flag or 503), on errors, and when there's nothing to show.
 */
export const StoreReviewTestimonials = (
  props: StoreReviewTestimonialsProps
) => {
  if (!REVIEWS_ENABLED) return null;
  return <StoreReviewTestimonialsInner {...props} />;
};

const StoreReviewTestimonialsInner = ({
  title,
  content,
  displayStyle,
  limit
}: StoreReviewTestimonialsProps) => {
  const perPage = Math.min(50, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  const listQuery = useStoreReviews({
    sort: "recent",
    rating: TESTIMONIAL_RATINGS,
    written: true,
    per_page: perPage
  });
  const summaryQuery = useStoreReviewSummary();

  const testimonials = useMemo<Testimonial[]>(
    () =>
      (listQuery.data?.pages?.[0]?.data || [])
        .map((review) => ({
          name: review.display_name,
          rating: review.rating,
          text: clip((review.body || review.title || "").trim()),
          avatar: null
        }))
        .filter((testimonial) => testimonial.text),
    [listQuery.data]
  );

  if (!testimonials.length) return null;
  const total = summaryQuery.data?.ratings_count || 0;

  return (
    <div data-store-review-testimonials>
      <TestimonialsView
        testimonials={testimonials}
        title={title || "Customer reviews"}
        content={content}
        displayStyle={displayStyle}
        footer={
          <p className="mt-8 font-body text-sm text-muted-foreground">
            A selection of recent 4★ and 5★ reviews.{" "}
            <Link
              href="/reviews"
              className="text-foreground underline underline-offset-4 hover:text-brand"
            >
              {total > 0
                ? `Read all ${pluralize(total, "review")}`
                : "Read all reviews"}
            </Link>
          </p>
        }
      />
    </div>
  );
};

export default StoreReviewTestimonials;

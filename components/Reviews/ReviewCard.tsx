import React from "react";
import { BadgeCheck, ThumbsUp } from "lucide-react";
import { Rating } from "@components/ui";
import { describeBipolar, formatReviewDate, pluralize } from "@lib/reviews";
import type {
  Review,
  ReviewAttributeSummary,
  ReviewPhoto
} from "../../types/reviews";
import { ReviewActions } from "./ReviewActions";

interface ReviewCardProps {
  review: Review;
  /** Attribute definitions from the summary, for labels like "Fit". */
  attributes: ReviewAttributeSummary[];
  productName?: string;
  onOpenPhoto: (photos: ReviewPhoto[], index: number) => void;
  /** The signed-in viewer wrote this one: no vote or report buttons. */
  isOwn?: boolean;
}

const STORE_NAME = process.env.NEXT_PUBLIC_SHORT_TITLE || "DNA";

/** "Fit: Runs small", "Quality: 4/5", in the summary's attribute order. */
const attributeLines = (
  review: Review,
  attributes: ReviewAttributeSummary[]
) => {
  const ratings = review.attribute_ratings || {};
  return attributes
    .filter((attribute) => typeof ratings[attribute.key] === "number")
    .map((attribute) => {
      const value = ratings[attribute.key];
      const text =
        attribute.kind === "bipolar"
          ? describeBipolar(attribute, value)
          : `${value}/5`;
      return text ? { key: attribute.key, label: attribute.label, text } : null;
    })
    .filter(Boolean) as Array<{ key: string; label: string; text: string }>;
};

export const ReviewCard = ({
  review,
  attributes,
  productName,
  onOpenPhoto,
  isOwn = false
}: ReviewCardProps) => {
  const date = formatReviewDate(review.published_at);
  const lines = attributeLines(review, attributes);
  const photos = review.photos || [];
  const hasBody = !!review.body && review.body.trim().length > 0;

  return (
    <article
      id={`review-${review.id}`}
      className="m-0 grid max-w-none gap-3 border-t border-border/60 py-6 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-6"
    >
      <div className="grid content-start gap-1.5 font-body text-sm">
        <span className="font-body-bold text-sm text-foreground">
          {review.display_name}
        </span>
        {review.verified_purchase && (
          <span className="inline-flex w-max items-center gap-1 text-xs text-green">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified buyer
          </span>
        )}
        {review.channel === "wholesale" && (
          <span className="inline-flex w-max rounded border border-blue px-1.5 py-px font-title text-[10.5px] uppercase tracking-widest text-blue">
            Wholesale buyer
          </span>
        )}
        {review.variant_label && (
          <span className="text-muted-foreground">
            Purchased: {review.variant_label}
          </span>
        )}
      </div>

      <div className="grid min-w-0 gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <Rating value={review.rating} size="sm" />
          {date && (
            <time
              dateTime={review.published_at || undefined}
              className="font-body text-xs text-muted-foreground"
            >
              {date}
              {review.edited && <span> · Edited</span>}
            </time>
          )}
        </div>

        {review.title && (
          <h3 className="font-body-bold text-base text-foreground">
            {review.title}
          </h3>
        )}

        {hasBody ? (
          <p className="m-0 whitespace-pre-line break-words font-body text-sm leading-relaxed text-foreground/80">
            {review.body}
          </p>
        ) : (
          <p className="m-0 font-body text-sm text-muted-foreground">
            Rated without a written review.
          </p>
        )}

        {lines.length > 0 && (
          <dl className="flex flex-wrap gap-x-4 gap-y-1 font-body text-xs text-muted-foreground">
            {lines.map((line) => (
              <div key={line.key} className="flex items-baseline gap-1.5">
                <dt className="font-title text-[11px] uppercase tracking-widest">
                  {line.label}
                </dt>
                <dd>{line.text}</dd>
              </div>
            ))}
          </dl>
        )}

        {photos.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {photos.map((photo, index) => {
              const alt =
                photo.alt ||
                (productName
                  ? `Customer photo of ${productName}`
                  : "Customer photo");
              return (
                <li key={photo.id}>
                  <button
                    type="button"
                    onClick={() => onOpenPhoto(photos, index)}
                    className="block h-16 w-16 overflow-hidden rounded-md bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    aria-label={`${alt} (opens a larger view)`}
                  >
                    <img
                      src={photo.thumb_url || photo.card_url}
                      alt={alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {review.incentivized && (
          <p className="m-0 font-body text-xs italic text-muted-foreground">
            Earned DNA points for this review
          </p>
        )}

        {review.reply?.body && (
          <div className="grid gap-1 border-l-2 border-brand py-2 pl-3.5 font-body text-sm">
            <span className="font-title text-[11px] uppercase tracking-widest text-brand-dark">
              Response from {STORE_NAME}
            </span>
            <p className="m-0 whitespace-pre-line break-words text-foreground/80">
              {review.reply.body}
            </p>
          </div>
        )}

        {isOwn ? (
          <p className="m-0 inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground">
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
            Your review
            {review.helpful_count > 0 &&
              ` · ${pluralize(
                review.helpful_count,
                "person",
                "people"
              )} found it helpful`}
          </p>
        ) : (
          <ReviewActions review={review} />
        )}
      </div>
    </article>
  );
};

export default ReviewCard;

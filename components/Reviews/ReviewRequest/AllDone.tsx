import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@components/ui";
import type {
  OwnReview,
  ReviewRequestItem,
  ReviewRequestPayload
} from "../../../types/reviews";
import { firstName, reviewOf, sessionPoints, SubmittedReviews } from "./flow";
import { OrderItemsList } from "./OrderItemsList";
import { eyebrow, primaryPill, secondaryPill } from "./RequestStatus";

interface AllDoneProps {
  request: ReviewRequestPayload;
  submitted: SubmittedReviews;
  /** Reviews first written on this page (not edits of older ones). */
  created: OwnReview[];
  /** The latest review sent from this page, for its status message. */
  lastReview: OwnReview | null;
  /** Move focus to the heading (after the shopper finished the last item). */
  focusHeading: boolean;
  onSelect: (item: ReviewRequestItem) => void;
  /** "Review DNA" / "Edit your review of DNA": reopens the store step. */
  storeAction?: { label: string; onClick: () => void };
}

const formatPoints = (value: number) => value.toLocaleString("en-US");

/**
 * The last screen: thanks, the points line and every item with Edit /
 * Review, plus links to keep shopping and to each product page. Points copy
 * never depends on the rating, and guests are pointed to an account rather
 * than shown a total they can't collect.
 */
export const AllDone = ({
  request,
  submitted,
  created,
  lastReview,
  focusHeading,
  onSelect,
  storeAction
}: AllDoneProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusHeading) headingRef.current?.focus();
  }, [focusHeading]);

  const name = firstName(lastReview?.display_name || request.display_name);
  const wroteSomething = !!lastReview || created.length > 0;
  const heading = wroteSomething
    ? `Thanks${name ? `, ${name}` : ""}`
    : request.items.every((item) => !!item.existing_review)
    ? "You've reviewed this order"
    : "All done";

  const points = sessionPoints(created);
  const { per_review: perReview, photo_bonus: photoBonus } = request.points;

  let pointsBlock: React.ReactNode = null;
  if (!request.has_account) {
    pointsBlock = (
      <p className="m-0 font-body text-sm text-foreground">
        <Link
          href="/signup"
          className="underline underline-offset-4 hover:text-brand-dark"
        >
          Create an account with this email to collect points next time
        </Link>
      </p>
    );
  } else if (points.pending > 0 || points.awarded > 0) {
    pointsBlock = (
      <div className="grid gap-1">
        {points.pending > 0 && (
          <p className="m-0 font-title text-2xl tabular-nums text-brand-dark">
            +{formatPoints(points.pending)} points
            <span className="block font-body text-xs normal-case text-muted-foreground">
              once {created.length > 1 ? "your reviews are" : "it's"} live
            </span>
          </p>
        )}
        {points.awarded > 0 && (
          <p className="m-0 font-title text-lg tabular-nums text-brand-dark">
            +{formatPoints(points.awarded)} points added
          </p>
        )}
        <p className="m-0 font-body text-xs text-muted-foreground">
          Points are the same whatever you rate.
        </p>
      </div>
    );
  } else if (
    perReview > 0 &&
    request.items.some((item) => !reviewOf(item, submitted))
  ) {
    // Only as a nudge while something is still unreviewed (e.g. skipped).
    pointsBlock = (
      <p className="m-0 max-w-xs font-body text-xs text-muted-foreground">
        Each review earns {formatPoints(perReview)} points once it&apos;s live
        {photoBonus > 0 && `, plus ${formatPoints(photoBonus)} with a photo`}.
        The same for every rating.
      </p>
    );
  }

  return (
    <div className="grid gap-8">
      <section
        aria-labelledby="review-request-done"
        className="grid justify-items-center gap-4 rounded-2xl border border-border px-5 py-8 text-center shadow-sm"
      >
        <h2
          id="review-request-done"
          ref={headingRef}
          tabIndex={-1}
          className="m-0 font-title text-xl uppercase tracking-[0.08em] text-foreground focus:outline-none"
        >
          {heading}
        </h2>
        {lastReview?.status_message && (
          <p className="m-0 max-w-xs font-body text-base text-foreground">
            {lastReview.status_message}
          </p>
        )}
        {pointsBlock}
        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:justify-center">
          <Button asChild className={primaryPill}>
            <Link href="/browse">Keep shopping</Link>
          </Button>
          {storeAction && (
            <Button
              type="button"
              variant="outline"
              className={secondaryPill}
              onClick={storeAction.onClick}
            >
              {storeAction.label}
            </Button>
          )}
        </div>
      </section>

      <section aria-labelledby="review-request-items" className="grid gap-3">
        <h2 id="review-request-items" className={eyebrow}>
          Your items
        </h2>
        <OrderItemsList
          items={request.items}
          submitted={submitted}
          onSelect={onSelect}
          linkProducts
        />
      </section>
    </div>
  );
};

export default AllDone;

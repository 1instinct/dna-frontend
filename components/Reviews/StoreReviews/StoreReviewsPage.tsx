import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Skeleton } from "@components/ui";
import { cn } from "@lib/utils";
import {
  DEFAULT_REVIEW_SORT,
  isReviewsDisabledError,
  pluralize,
  STORE_NAME,
  STORE_REVIEWS_PER_PAGE
} from "@lib/reviews";
import { useReviewUserId } from "@hooks/useReviews";
import {
  useStoreReviewForm,
  useStoreReviews,
  useStoreReviewSummary
} from "@hooks/useStoreReviews";
import type { ReviewSort, StarRating } from "../../../types/reviews";
import { ReviewCard } from "../ReviewCard";
import { AttributeBars, RatingOverview } from "../ReviewsOverview";
import {
  CardSkeleton,
  EmptyBox,
  ErrorState,
  ShowMoreButton
} from "../ReviewStates";
import { ReviewsToolbar } from "../ReviewsToolbar";
import { ReviewUsButton } from "./ReviewUsButton";

const eyebrow =
  "m-0 font-title text-[11px] leading-4 uppercase tracking-[0.2em] text-muted-foreground";

/** Store reviews have no photos; ReviewCard still wants a handler. */
const noPhotos = () => undefined;

/** Shown when the API says store reviews are switched off (503). */
export const StoreReviewsUnavailable = () => (
  <div className="section-container grid justify-items-center gap-4 py-24 text-center">
    <p className={eyebrow}>404</p>
    <h1 className="m-0 font-title text-2xl uppercase tracking-[0.08em] text-foreground">
      Page not found
    </h1>
    <p className="m-0 max-w-sm font-body text-sm text-muted-foreground">
      This page isn&apos;t available right now.
    </p>
    <Button
      asChild
      className="min-h-[44px] rounded-full px-6 font-title text-xs uppercase tracking-[0.12em] text-black"
    >
      <Link href="/">Go to the homepage</Link>
    </Button>
  </div>
);

const SummarySkeleton = () => (
  <div className="grid gap-8 md:grid-cols-2" aria-hidden="true">
    <div className="grid gap-2">
      <Skeleton className="h-14 w-24" />
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-4 w-48" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
    <div className="grid content-start gap-5">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

/**
 * `/reviews`: every published (retail) store review. Big average, histogram
 * bars that filter the list, store attribute bars, sort, cards and "Show
 * more". Low ratings are never hidden and the default sort is "Most
 * helpful" (FTC / Google review policies).
 */
export const StoreReviewsPage = () => {
  const [rating, setRating] = useState<StarRating | null>(null);
  const [written, setWritten] = useState(false);
  const [sort, setSort] = useState<ReviewSort>(DEFAULT_REVIEW_SORT);

  const summaryQuery = useStoreReviewSummary();
  const summary = summaryQuery.data;
  const hasRatings = (summary?.ratings_count || 0) > 0;

  const userId = useReviewUserId();
  const formQuery = useStoreReviewForm({ enabled: !!userId });
  const ownReviewId = formQuery.data?.existing_review?.id ?? null;

  const filters = useMemo(
    () => ({
      sort,
      rating: rating ? [rating] : [],
      written,
      per_page: STORE_REVIEWS_PER_PAGE
    }),
    [sort, rating, written]
  );
  const listQuery = useStoreReviews(filters, {
    enabled: summaryQuery.isSuccess && hasRatings
  });

  const reviews = useMemo(
    () => (listQuery.data?.pages || []).flatMap((page) => page.data || []),
    [listQuery.data]
  );
  const lastPage = listQuery.data?.pages?.[listQuery.data.pages.length - 1];
  const totalCount = lastPage?.meta?.total_count ?? 0;
  const attributes = summary?.attributes || [];
  const filtersActive = !!rating || written;

  if (summaryQuery.isError && isReviewsDisabledError(summaryQuery.error)) {
    return <StoreReviewsUnavailable />;
  }

  const clearFilters = () => {
    setRating(null);
    setWritten(false);
  };

  const countLine = (() => {
    if (!listQuery.data) return "";
    const noun = written ? "written review" : "review";
    const parts = [
      totalCount > reviews.length
        ? `Showing ${reviews.length} of ${pluralize(totalCount, noun)}`
        : `Showing ${pluralize(reviews.length, noun)}`
    ];
    if (rating) parts.push(`${rating}★`);
    return parts.join(" · ");
  })();

  const renderList = () => {
    if (listQuery.isError && !listQuery.data) {
      return (
        <ErrorState
          message="We couldn't load the reviews right now."
          onRetry={() => listQuery.refetch()}
        />
      );
    }
    if (!listQuery.data) {
      return (
        <div>
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );
    }
    if (!reviews.length) {
      return (
        <EmptyBox>
          <p className="m-0">No reviews match these filters.</p>
          {filtersActive && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </EmptyBox>
      );
    }
    return (
      <div
        className={cn(
          "grid transition-opacity",
          listQuery.isFetching && !listQuery.isFetchingNextPage && "opacity-60"
        )}
        aria-busy={listQuery.isFetching}
      >
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            attributes={attributes}
            onOpenPhoto={noPhotos}
            isOwn={ownReviewId === review.id}
          />
        ))}
      </div>
    );
  };

  const renderBody = () => {
    if (summaryQuery.isLoading || (!summary && summaryQuery.isIdle)) {
      return (
        <>
          <SummarySkeleton />
          <CardSkeleton />
        </>
      );
    }
    if (summaryQuery.isError || !summary) {
      return (
        <ErrorState
          message="We couldn't load reviews right now."
          onRetry={() => summaryQuery.refetch()}
        />
      );
    }
    if (!hasRatings) {
      return (
        <EmptyBox>
          <p className="m-0">
            No reviews yet. Ordered from us? Your review helps the next person.
          </p>
          <ReviewUsButton />
        </EmptyBox>
      );
    }
    return (
      <>
        <section
          aria-labelledby="store-reviews-summary"
          className={cn(
            "grid items-start gap-8 rounded-2xl border border-border/60 bg-card p-5 sm:p-7",
            attributes.length > 0 && "md:grid-cols-2 md:gap-12"
          )}
        >
          <h2 id="store-reviews-summary" className="sr-only">
            Rating summary
          </h2>
          <RatingOverview
            summary={summary}
            activeRating={rating}
            onSelectRating={setRating}
          />
          {attributes.length > 0 && (
            <div className="grid content-start gap-4">
              <p className={eyebrow}>Customers rated</p>
              <AttributeBars attributes={attributes} />
            </div>
          )}
        </section>

        <section aria-labelledby="store-reviews-list" className="grid gap-6">
          <h2 id="store-reviews-list" className="sr-only">
            Reviews
          </h2>
          <div className="grid gap-3">
            <ReviewsToolbar
              showPhotosFilter={false}
              written={written}
              onWritten={setWritten}
              rating={rating}
              onClearRating={() => setRating(null)}
              sort={sort}
              onSort={setSort}
            />
            <p
              className="m-0 min-h-[1.25rem] font-body text-sm tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              {countLine}
            </p>
          </div>
          {renderList()}
          {listQuery.hasNextPage && reviews.length > 0 && (
            <ShowMoreButton
              onClick={() => listQuery.fetchNextPage()}
              loading={listQuery.isFetchingNextPage}
            >
              Show more reviews
            </ShowMoreButton>
          )}
        </section>
      </>
    );
  };

  return (
    <div
      className="section-container grid gap-8 py-8 sm:py-12"
      data-store-reviews
    >
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-border/60 pb-6">
        <div className="grid gap-2">
          <p className={eyebrow}>Customer reviews</p>
          <h1 className="m-0 font-title text-2xl uppercase tracking-[0.08em] text-foreground sm:text-3xl">
            Reviews of {STORE_NAME}
          </h1>
          <p className="m-0 max-w-xl font-body text-sm text-muted-foreground">
            What customers say about ordering from us. We show every published
            review, whatever the rating.
          </p>
        </div>
        {hasRatings && <ReviewUsButton />}
      </header>
      {renderBody()}
    </div>
  );
};

export default StoreReviewsPage;

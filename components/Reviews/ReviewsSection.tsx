import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button, Skeleton } from "@components/ui";
import { cn } from "@lib/utils";
import {
  DEFAULT_REVIEW_SORT,
  pluralize,
  REVIEWS_ENABLED,
  REVIEWS_PER_PAGE
} from "@lib/reviews";
import {
  useProductReviews,
  useReviewForm,
  useReviewSummary,
  useReviewUserId
} from "@hooks/useReviews";
import type {
  ReviewPhoto,
  ReviewScope,
  ReviewSort,
  StarRating
} from "../../types/reviews";
import { AiSummaryCard } from "./AiSummaryCard";
import { LightboxState, MediaLightbox } from "./MediaLightbox";
import { REVIEWS_SECTION_ID } from "./RatingSummary";
import { ReviewCard } from "./ReviewCard";
import { ReviewMediaStrip } from "./ReviewMediaStrip";
import { AttributeBars, RatingOverview } from "./ReviewsOverview";
import { ReviewsToolbar } from "./ReviewsToolbar";
import { WriteReviewButton } from "./WriteReviewButton";

interface ReviewsSectionProps {
  /** Product slug (or id). Must match the SSR prefetch key. */
  productId: string | undefined;
  productName?: string;
  /** Wholesale PDPs show all channels plus a "Wholesale only" chip. */
  wholesale?: boolean;
  className?: string;
}

/** Starts the list fetch once the section is within ~one screen of the viewport. */
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

const OverviewSkeleton = () => (
  <div className="grid gap-8 sm:grid-cols-2" aria-hidden="true">
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

const CardSkeleton = () => (
  <div
    className="grid gap-3 border-t border-border/60 py-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6"
    aria-hidden="true"
  >
    <div className="grid content-start gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
    <div className="grid gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  </div>
);

const ErrorState = ({
  message,
  onRetry
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div
    role="alert"
    className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border p-7 text-center font-body text-sm text-muted-foreground"
  >
    <p className="m-0">{message}</p>
    <Button variant="outline" size="sm" onClick={onRetry}>
      Try again
    </Button>
  </div>
);

const EmptyBox = ({ children }: { children: React.ReactNode }) => (
  <div className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border p-7 text-center font-body text-sm text-muted-foreground">
    {children}
  </div>
);

/**
 * The PDP reviews block (`#reviews`): overview, attribute bars, AI summary,
 * photo strip, toolbar, review list and "Show more". The summary loads right
 * away; the list waits until the section nears the viewport unless SSR
 * already put the first page in the cache.
 *
 * Compliance: default sort is "Most helpful", low ratings are never hidden,
 * and the channel split is by buyer, never by rating.
 */
export const ReviewsSection = (props: ReviewsSectionProps) => {
  if (!REVIEWS_ENABLED || !props.productId) return null;
  return <ReviewsSectionInner {...props} />;
};

const ReviewsSectionInner = ({
  productId,
  productName,
  wholesale = false,
  className
}: ReviewsSectionProps) => {
  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const nearViewport = useNearViewport(sectionRef);

  const [wholesaleOnly, setWholesaleOnly] = useState(false);
  const [rating, setRating] = useState<StarRating | null>(null);
  const [withPhotos, setWithPhotos] = useState(false);
  const [written, setWritten] = useState(false);
  const [sort, setSort] = useState<ReviewSort>(DEFAULT_REVIEW_SORT);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const requestedScope: ReviewScope = wholesale
    ? wholesaleOnly
      ? "wholesale"
      : "all"
    : "retail";

  // Leaving wholesale mode (sign-out) resets the wholesale-only chip.
  useEffect(() => {
    if (!wholesale) setWholesaleOnly(false);
  }, [wholesale]);

  const summaryQuery = useReviewSummary(productId, requestedScope);
  // Signed-in only: tells us which review is the viewer's own (no voting on it).
  const userId = useReviewUserId();
  const formQuery = useReviewForm(productId, { enabled: !!userId });
  const ownReviewId = formQuery.data?.existing_review?.id ?? null;
  const summary = summaryQuery.data;
  // The API answers 403 for non-wholesale tokens; the hook falls back to retail.
  const scope: ReviewScope = summary?.scope || requestedScope;
  const hasRatings = (summary?.ratings_count || 0) > 0;

  const filters = useMemo(
    () => ({
      scope: requestedScope,
      sort,
      rating: rating ? [rating] : [],
      with_photos: withPhotos,
      written,
      per_page: REVIEWS_PER_PAGE
    }),
    [requestedScope, sort, rating, withPhotos, written]
  );

  const listQuery = useProductReviews(productId, filters, {
    enabled: nearViewport && summaryQuery.isSuccess && hasRatings
  });

  const reviews = useMemo(
    () => (listQuery.data?.pages || []).flatMap((page) => page.data || []),
    [listQuery.data]
  );
  const lastPage = listQuery.data?.pages?.[listQuery.data.pages.length - 1];
  const totalCount = lastPage?.meta?.total_count ?? 0;
  const attributes = summary?.attributes || [];
  const filtersActive = !!rating || withPhotos || written;

  const clearFilters = () => {
    setRating(null);
    setWithPhotos(false);
    setWritten(false);
  };

  const toggleWholesaleOnly = (value: boolean) => {
    setWholesaleOnly(value);
    setRating(null);
  };

  const openPhotos = (photos: ReviewPhoto[], index: number) =>
    setLightbox({ photos, index });

  const countLine = (() => {
    if (!listQuery.data) return "";
    const noun =
      (scope === "wholesale" ? "wholesale " : "") +
      (written ? "written review" : "review");
    const parts = [
      totalCount > reviews.length
        ? `Showing ${reviews.length} of ${pluralize(totalCount, noun)}`
        : `Showing ${pluralize(reviews.length, noun)}`
    ];
    if (rating) parts.push(`${rating}★`);
    if (withPhotos) parts.push("with photos");
    return parts.join(" · ");
  })();

  const showAi = !!summary?.ai_summary && scope !== "wholesale";
  const overviewColumns = 1 + (attributes.length ? 1 : 0) + (showAi ? 1 : 0);

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
            productName={productName}
            onOpenPhoto={openPhotos}
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
          <OverviewSkeleton />
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

    const toolbar = (
      <ReviewsToolbar
        withPhotos={withPhotos}
        onWithPhotos={setWithPhotos}
        written={written}
        onWritten={setWritten}
        showWholesaleFilter={wholesale && (scope !== "retail" || wholesaleOnly)}
        wholesaleOnly={wholesaleOnly}
        onWholesaleOnly={toggleWholesaleOnly}
        rating={rating}
        onClearRating={() => setRating(null)}
        sort={sort}
        onSort={setSort}
      />
    );

    if (!hasRatings) {
      return (
        <>
          {wholesaleOnly && toolbar}
          <EmptyBox>
            <p className="m-0">
              {wholesaleOnly
                ? "No wholesale reviews yet."
                : "No reviews yet. Bought this? Your review helps the next person."}
            </p>
            {!wholesaleOnly && (
              <WriteReviewButton
                productId={productId}
                productName={productName}
              />
            )}
          </EmptyBox>
        </>
      );
    }

    return (
      <>
        <div
          className={cn(
            "grid items-start gap-8",
            overviewColumns === 2 && "sm:grid-cols-2",
            overviewColumns === 3 &&
              "sm:grid-cols-2 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1.3fr)]",
            overviewColumns === 1 && "max-w-sm"
          )}
        >
          <RatingOverview
            summary={summary}
            activeRating={rating}
            onSelectRating={setRating}
          />
          <AttributeBars attributes={attributes} />
          {showAi && (
            <AiSummaryCard
              summary={summary.ai_summary}
              scope={scope}
              className={
                overviewColumns === 3 ? "sm:col-span-2 md:col-span-1" : ""
              }
            />
          )}
        </div>

        <ReviewMediaStrip
          photos={summary.latest_photos || []}
          totalCount={summary.photos_count}
          productName={productName}
          onOpen={(index) => openPhotos(summary.latest_photos || [], index)}
          onShowAll={() => setWithPhotos(true)}
        />

        <div className="grid gap-3">
          {toolbar}
          <p
            className="m-0 min-h-[1.25rem] font-body text-sm tabular-nums text-muted-foreground"
            aria-live="polite"
          >
            {countLine}
          </p>
        </div>

        <div className="grid gap-6">
          {renderList()}
          {listQuery.hasNextPage && reviews.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => listQuery.fetchNextPage()}
                disabled={listQuery.isFetchingNextPage}
                className="min-h-[44px] rounded-full px-6 font-title text-xs uppercase tracking-[0.12em]"
              >
                {listQuery.isFetchingNextPage
                  ? "Loading…"
                  : "Show more reviews"}
              </Button>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <section
      id={REVIEWS_SECTION_ID}
      ref={sectionRef}
      aria-labelledby={headingId}
      className={cn("mt-12 grid scroll-mt-24 gap-7", className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-border/60">
        <h2
          id={headingId}
          tabIndex={-1}
          data-reviews-heading
          className="-mb-px inline-block border-b-2 border-brand pb-3 font-title text-sm uppercase tracking-[0.12em] text-foreground focus:outline-none"
        >
          Reviews
          {hasRatings && (
            <span className="tabular-nums"> ({summary?.ratings_count})</span>
          )}
        </h2>
        {hasRatings && (
          <WriteReviewButton
            productId={productId}
            productName={productName}
            size="sm"
            className="mb-2"
          />
        )}
      </div>

      {renderBody()}

      <MediaLightbox
        state={lightbox}
        onClose={() => setLightbox(null)}
        productName={productName}
      />
    </section>
  );
};

export default ReviewsSection;

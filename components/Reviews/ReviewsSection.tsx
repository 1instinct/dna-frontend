import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Button,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@components/ui";
import { cn } from "@lib/utils";
import {
  DEFAULT_REVIEW_SORT,
  isReviewsDisabledError,
  parseQuestionHash,
  pluralize,
  questionAnchorId,
  REVIEWS_ENABLED,
  REVIEWS_PER_PAGE
} from "@lib/reviews";
import {
  useProductReviews,
  useReviewForm,
  useReviewSummary,
  useReviewUserId
} from "@hooks/useReviews";
import { useQuestions } from "@hooks/useQuestions";
import type {
  ReviewPhoto,
  ReviewScope,
  ReviewSort,
  StarRating
} from "../../types/reviews";
import { AiSummaryCard } from "./AiSummaryCard";
import { LightboxState, MediaLightbox } from "./MediaLightbox";
import { AskQuestionForm, QuestionsList } from "./Questions";
import { REVIEWS_SECTION_ID } from "./RatingSummary";
import { ReviewCard } from "./ReviewCard";
import { ReviewMediaStrip } from "./ReviewMediaStrip";
import { AttributeBars, RatingOverview } from "./ReviewsOverview";
import {
  CardSkeleton,
  EmptyBox,
  ErrorState,
  ShowMoreButton
} from "./ReviewStates";
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

type SectionTab = "reviews" | "questions";

/** `#questions` opens the Questions tab; `#question-<id>` also scrolls to it. */
const readQuestionsHash = (): { open: boolean; questionId: number | null } => {
  if (typeof window === "undefined") return { open: false, questionId: null };
  const hash = window.location.hash;
  const questionId = parseQuestionHash(hash);
  return { open: hash === "#questions" || questionId !== null, questionId };
};

/** Pages to load while looking for a deep-linked question before giving up. */
const MAX_DEEP_LINK_PAGES = 10;

/**
 * The PDP reviews block (`#reviews`): tabs `Reviews (N)` / `Questions (M)`
 * (the Questions tab is left out while Q&A is switched off, 503). Reviews:
 * overview, attribute bars, AI summary, photo strip, toolbar, review list
 * and "Show more". The summary loads right away; the lists wait until the
 * section nears the viewport unless SSR already put them in the cache.
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
  const [tab, setTab] = useState<SectionTab>("reviews");
  const [targetQuestionId, setTargetQuestionId] = useState<number | null>(null);
  const [wantsQuestions, setWantsQuestions] = useState(false);

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

  /* Questions (M6) -------------------------------------------------- */

  const questionsQuery = useQuestions(productId, {
    enabled: nearViewport || wantsQuestions
  });
  const questionPages = questionsQuery.data?.pages;
  // No tab without a first page, nor while Q&A is switched off (503).
  const showQuestions =
    !!questionPages && !isReviewsDisabledError(questionsQuery.error);
  const questionsTotal =
    questionPages?.[0]?.meta?.total_count ??
    questionPages?.reduce((sum, page) => sum + (page.data?.length || 0), 0) ??
    0;

  // Deep links from the answer email (`#question-<id>`) and "Sign in to ask" (`#questions`).
  useEffect(() => {
    const apply = () => {
      const { open, questionId } = readQuestionsHash();
      if (!open) return;
      setWantsQuestions(true);
      setTab("questions");
      setTargetQuestionId(questionId);
      sectionRef.current?.scrollIntoView({ block: "start" });
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  // Once the deep-linked question is loaded, scroll to it and focus it;
  // load more pages while it isn't there yet.
  const {
    hasNextPage: moreQuestions,
    isFetchingNextPage: loadingMoreQuestions,
    fetchNextPage: fetchMoreQuestions
  } = questionsQuery;
  useEffect(() => {
    if (targetQuestionId === null || !showQuestions || tab !== "questions") {
      return;
    }
    const found = questionPages?.some((page) =>
      (page.data || []).some((question) => question.id === targetQuestionId)
    );
    if (found) {
      const timer = window.setTimeout(() => {
        const node = document.getElementById(
          questionAnchorId(targetQuestionId)
        );
        if (!node) return;
        node.scrollIntoView({ block: "start" });
        node.focus({ preventScroll: true });
        setTargetQuestionId(null);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    if (moreQuestions && (questionPages?.length || 0) < MAX_DEEP_LINK_PAGES) {
      if (!loadingMoreQuestions) fetchMoreQuestions();
      return;
    }
    // Not found (no longer public): the tab is open, that's all we can do.
    setTargetQuestionId(null);
  }, [
    targetQuestionId,
    showQuestions,
    tab,
    questionPages,
    moreQuestions,
    loadingMoreQuestions,
    fetchMoreQuestions
  ]);

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
            <ShowMoreButton
              onClick={() => listQuery.fetchNextPage()}
              loading={listQuery.isFetchingNextPage}
            >
              Show more reviews
            </ShowMoreButton>
          )}
        </div>
      </>
    );
  };

  const reviewsCount = hasRatings ? (
    <span className="tabular-nums"> ({summary?.ratings_count})</span>
  ) : null;
  const tabClass =
    "-mb-px min-h-[44px] px-0 pb-3 pt-2 text-sm leading-5 tracking-[0.12em] data-[state=active]:text-foreground";

  return (
    <section
      id={REVIEWS_SECTION_ID}
      ref={sectionRef}
      aria-labelledby={headingId}
      className={cn("mt-12 scroll-mt-24", className)}
    >
      <Tabs
        value={showQuestions ? tab : "reviews"}
        onValueChange={(value) =>
          setTab(value === "questions" ? "questions" : "reviews")
        }
        className="grid gap-7"
      >
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-border/60">
          {showQuestions ? (
            <>
              <h2
                id={headingId}
                tabIndex={-1}
                data-reviews-heading
                className="sr-only"
              >
                Reviews
                {hasRatings && ` (${summary?.ratings_count})`} and questions
              </h2>
              <TabsList
                aria-labelledby={headingId}
                className="h-auto gap-6 border-0"
              >
                <TabsTrigger value="reviews" className={tabClass}>
                  Reviews{reviewsCount}
                </TabsTrigger>
                <TabsTrigger value="questions" className={tabClass}>
                  Questions
                  <span className="tabular-nums"> ({questionsTotal})</span>
                </TabsTrigger>
              </TabsList>
            </>
          ) : (
            <h2
              id={headingId}
              tabIndex={-1}
              data-reviews-heading
              className="-mb-px inline-block border-b-2 border-brand pb-3 font-title text-sm uppercase tracking-[0.12em] text-foreground focus:outline-none"
            >
              Reviews{reviewsCount}
            </h2>
          )}
          {hasRatings && (
            <WriteReviewButton
              productId={productId}
              productName={productName}
              size="sm"
              className="mb-2"
            />
          )}
        </div>

        {showQuestions ? (
          <>
            <TabsContent value="reviews" className="mt-0 grid gap-7">
              {renderBody()}
            </TabsContent>
            <TabsContent
              value="questions"
              className="mt-0 grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_320px]"
            >
              <QuestionsList query={questionsQuery} />
              <AskQuestionForm
                productId={productId as string}
                productName={productName}
                className="md:sticky md:top-24"
              />
            </TabsContent>
          </>
        ) : (
          renderBody()
        )}
      </Tabs>

      <MediaLightbox
        state={lightbox}
        onClose={() => setLightbox(null)}
        productName={productName}
      />
    </section>
  );
};

export default ReviewsSection;

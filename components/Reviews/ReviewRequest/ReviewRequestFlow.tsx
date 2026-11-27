import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Button } from "@components/ui";
import { cn } from "@lib/utils";
import { isInvalidReviewToken } from "@lib/reviews";
import type {
  OwnReview,
  ReviewRequestItem,
  ReviewRequestPayload,
  StarRating
} from "../../../types/reviews";
import { ReviewComposer } from "../ReviewComposer";
import type { ComposerQueue } from "../ReviewComposer";
import { AllDone } from "./AllDone";
import {
  composerFormFor,
  EmailLinkIntent,
  itemPositionLabel,
  pendingAfter,
  pickStartPoint,
  reviewOf,
  SubmittedReviews
} from "./flow";
import { OrderItemsList } from "./OrderItemsList";
import { eyebrow, RequestColumn } from "./RequestStatus";

/** Props for the store-review step that follows the last item (M5). */
export interface StoreReviewStepProps {
  token: string;
  request: ReviewRequestPayload;
  onDone: () => void;
}

/**
 * The "How was ordering from DNA?" step. Store reviews are written in M5
 * (`POST /api/v1/store_reviews` with the same `X-Review-Token`), so there is
 * nothing to show yet.
 * TODO(M5): set this to the StoreReviewStep component.
 */
const STORE_REVIEW_STEP =
  null as React.ComponentType<StoreReviewStepProps> | null;

type View = "items" | "store" | "done";

interface ReviewRequestFlowProps {
  token: string;
  request: ReviewRequestPayload;
  /** The star tapped in the email, read before the URL was cleaned up. */
  intent: EmailLinkIntent;
  /** Called once on mount so the page can drop `?item=&rating=` from the URL. */
  onIntentConsumed: () => void;
  /** A write came back `invalid_token`: show the expired-link page. */
  onLinkDead: () => void;
}

/**
 * The email landing flow: one composer per item ("Item 1 of 3"), Skip,
 * Edit for items already reviewed, then (M5) the store question and the
 * "All done" screen. Everything goes out with `X-Review-Token`.
 */
export const ReviewRequestFlow = ({
  token,
  request,
  intent,
  onIntentConsumed,
  onLinkDead
}: ReviewRequestFlowProps) => {
  const { items } = request;
  const rootRef = useRef<HTMLDivElement>(null);

  const [start] = useState(() => pickStartPoint(items, intent));
  const [currentId, setCurrentId] = useState<number | null>(
    start.item?.line_item_id ?? null
  );
  const [preselect, setPreselect] = useState<StarRating | null>(start.rating);
  const [view, setView] = useState<View>(start.item ? "items" : "done");
  // Bumped on every move so the composer remounts fresh for each item.
  const [visit, setVisit] = useState(0);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState<SubmittedReviews>({});
  const [createdIds, setCreatedIds] = useState<number[]>([]);
  const [lastReview, setLastReview] = useState<OwnReview | null>(null);
  const [onDoneStep, setOnDoneStep] = useState(false);
  // Focus only moves after the shopper does something, not on page load.
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    onIntentConsumed();
    // Once per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = items.find((item) => item.line_item_id === currentId) || null;
  const pending = pendingAfter(items, currentId, submitted, skipped);
  const next = pending[0] || null;

  const storeStepAvailable =
    !!STORE_REVIEW_STEP &&
    request.store_review.enabled &&
    !request.store_review.existing_review;

  const scrollToTop = () => {
    // Instant, so it never fights the focus move (and needs no motion).
    rootRef.current?.scrollIntoView({ block: "start" });
  };

  const goTo = useCallback((item: ReviewRequestItem) => {
    setCurrentId(item.line_item_id);
    setVisit((count) => count + 1);
    setPreselect(null);
    setOnDoneStep(false);
    setView("items");
    setInteracted(true);
    scrollToTop();
  }, []);

  const finish = () => {
    setInteracted(true);
    setOnDoneStep(false);
    setView(storeStepAvailable ? "store" : "done");
    scrollToTop();
  };

  const skip = () => {
    if (!current) return;
    const nextSkipped = skipped.includes(current.line_item_id)
      ? skipped
      : [...skipped, current.line_item_id];
    setSkipped(nextSkipped);
    const rest = pendingAfter(
      items,
      current.line_item_id,
      submitted,
      nextSkipped
    );
    if (rest[0]) goTo(rest[0]);
    else finish();
  };

  const handleSubmitted = (review: OwnReview) => {
    if (!current) return;
    const id = current.line_item_id;
    const nextSubmitted = { ...submitted, [id]: review };
    if (!reviewOf(current, submitted)) {
      setCreatedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    }
    setSubmitted(nextSubmitted);
    setLastReview(review);
    const nextSkipped = skipped.filter((skippedId) => skippedId !== id);
    setSkipped(nextSkipped);
    // More to review: the composer shows its Done step with "Next up".
    if (pendingAfter(items, id, nextSubmitted, nextSkipped).length) {
      setOnDoneStep(true);
    } else {
      finish();
    }
  };

  const handleError = (error: unknown) => {
    if (isInvalidReviewToken(error)) onLinkDead();
  };

  const queue: ComposerQueue = {
    next,
    remaining: pending.length,
    nextLabel: next ? itemPositionLabel(items, next) : undefined,
    onNext: () => {
      if (next) goTo(next);
    }
  };

  const currentReview = current ? reviewOf(current, submitted) : null;
  const form = useMemo(
    () => (current ? composerFormFor(request, current, currentReview) : null),
    [request, current, currentReview]
  );

  const reviewedCount = items.filter((item) =>
    reviewOf(item, submitted)
  ).length;
  const progress =
    view === "items" && current
      ? itemPositionLabel(items, current)
      : `${reviewedCount} of ${items.length} reviewed`;

  const created = createdIds
    .map((id) => submitted[id])
    .filter((review): review is OwnReview => !!review);

  const StoreStep = STORE_REVIEW_STEP;

  let body: React.ReactNode;
  if (view === "store" && StoreStep) {
    body = (
      <StoreStep
        token={token}
        request={request}
        onDone={() => setView("done")}
      />
    );
  } else if (view === "items" && current && form) {
    body = (
      <div
        className={cn(
          "grid items-start gap-8",
          items.length > 1 && "lg:grid-cols-[minmax(0,1fr)_300px]"
        )}
      >
        <div className="grid gap-3">
          <ReviewComposer
            key={`${current.line_item_id}:${visit}`}
            mode="page"
            target={{
              productId: current.slug || current.product_id,
              name: current.name,
              imageUrl: current.image_url,
              variantLabel: current.variant_label,
              lineItemId: current.line_item_id
            }}
            form={form}
            reviewToken={token}
            initialRating={preselect ?? undefined}
            queue={queue}
            // Only true after the shopper acts, never on page load.
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={interacted}
            onSubmitted={handleSubmitted}
            onError={handleError}
          />
          {!onDoneStep && (
            <Button
              type="button"
              variant="ghost"
              className="min-h-[44px] w-full rounded-full font-title text-xs uppercase tracking-[0.12em] text-muted-foreground sm:ml-auto sm:w-auto"
              onClick={skip}
            >
              Skip this item
            </Button>
          )}
        </div>
        {items.length > 1 && (
          <section
            aria-labelledby="review-request-order"
            className="grid gap-3"
          >
            <h2 id="review-request-order" className={eyebrow}>
              In this order
            </h2>
            <OrderItemsList
              items={items}
              submitted={submitted}
              currentId={onDoneStep ? null : current.line_item_id}
              onSelect={goTo}
            />
          </section>
        )}
      </div>
    );
  } else {
    body = (
      <AllDone
        request={request}
        submitted={submitted}
        created={created}
        lastReview={lastReview}
        focusHeading={interacted}
        onSelect={goTo}
      />
    );
  }

  return (
    <RequestColumn wide={view === "items" && items.length > 1}>
      <div ref={rootRef} className="grid scroll-mt-4 gap-6">
        <header className="grid gap-1.5">
          <p className={eyebrow}>Review your order</p>
          <h1 className="m-0 break-words font-title text-2xl uppercase tracking-[0.08em] text-foreground">
            Order #{request.order_number}
          </h1>
          <p
            className="m-0 font-body text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {progress}
            {view === "items" && current && (
              <span className="sr-only">: {current.name}</span>
            )}
          </p>
        </header>
        {body}
      </div>
    </RequestColumn>
  );
};

export default ReviewRequestFlow;

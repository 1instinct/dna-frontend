import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Button } from "@components/ui";
import { cn } from "@lib/utils";
import { isInvalidReviewToken, STORE_NAME } from "@lib/reviews";
import type {
  OwnReview,
  OwnStoreReview,
  ReviewRequestItem,
  ReviewRequestPayload,
  ReviewRequestStoreReview,
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
import { StoreReviewStep } from "./StoreReviewStep";

/** Props for the store-review step that follows the last item (M5). */
export interface StoreReviewStepProps {
  token: string;
  request: ReviewRequestPayload;
  onDone: () => void;
}

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
 * Edit for items already reviewed, then the store question ("How was
 * shopping with us?", when store reviews are on and this order has no store
 * review yet) and the "All done" screen, which can reopen the store step.
 * Everything goes out with `X-Review-Token`.
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

  const storeEnabled = !!request.store_review?.enabled;
  const [storeReview, setStoreReview] = useState<
    OwnStoreReview | ReviewRequestStoreReview | null
  >(request.store_review?.existing_review || null);
  // The store step is offered once per visit (Skip means "not now").
  const [storeOffered, setStoreOffered] = useState(false);

  const [start] = useState(() => pickStartPoint(items, intent));
  const [currentId, setCurrentId] = useState<number | null>(
    start.item?.line_item_id ?? null
  );
  const [preselect, setPreselect] = useState<StarRating | null>(start.rating);
  // A completed link opens on the store step when the order has no store review yet.
  const [view, setView] = useState<View>(() =>
    start.item
      ? "items"
      : storeEnabled && !request.store_review.existing_review
      ? "store"
      : "done"
  );
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

  useEffect(() => {
    if (view === "store") setStoreOffered(true);
  }, [view]);

  const storeStepDue = storeEnabled && !storeReview && !storeOffered;

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
    setView(storeStepDue ? "store" : "done");
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
      : view === "store"
      ? `${reviewedCount} of ${items.length} reviewed · One more question`
      : `${reviewedCount} of ${items.length} reviewed`;

  const created = createdIds
    .map((id) => submitted[id])
    .filter((review): review is OwnReview => !!review);

  const openStoreStep = () => {
    setInteracted(true);
    setOnDoneStep(false);
    setView("store");
    scrollToTop();
  };

  let body: React.ReactNode;
  if (view === "store" && storeEnabled) {
    body = (
      <StoreReviewStep
        token={token}
        request={request}
        existingReview={storeReview}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={interacted}
        onSubmitted={setStoreReview}
        onLinkDead={onLinkDead}
        onDone={() => {
          setInteracted(true);
          setView("done");
          scrollToTop();
        }}
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
        storeAction={
          storeEnabled
            ? {
                label: storeReview
                  ? `Edit your review of ${STORE_NAME}`
                  : `Review ${STORE_NAME}`,
                onClick: openStoreStep
              }
            : undefined
        }
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

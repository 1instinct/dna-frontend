import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, PenLine, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Rating,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast
} from "@components/ui";
import { cn } from "@lib/utils";
import {
  formatReviewDate,
  REVIEW_STATUS_LABELS,
  reviewErrorMessage,
  STORE_NAME
} from "@lib/reviews";
import {
  useDeleteReview,
  useMyReviews,
  useReviewables
} from "@hooks/useReviews";
import { useStoreReviewForm } from "@hooks/useStoreReviews";
import type { OwnReview, Reviewable, ReviewStatus } from "../../types/reviews";
import { ReviewComposerSheet } from "./ReviewComposer";
import type { ReviewTarget } from "./ReviewComposer";
import { reviewTargetFromReviewable } from "./OrderItemReview";
import { StoreReviewComposerSheet } from "./StoreReviews/StoreReviewComposerSheet";

export type AccountReviewsTab = "to-review" | "mine";

const STATUS_STYLES: Record<ReviewStatus, string> = {
  published: "border-green/30 bg-green/10 text-green",
  pending: "border-brand-secondary bg-brand-secondary/40 text-foreground",
  rejected: "border-border bg-muted text-muted-foreground",
  hidden: "border-border bg-muted text-muted-foreground"
};

/** Explicit size: `cn()` drops the trigger's custom `text-title-xs`. */
const TAB_CLASS = "min-h-[44px] px-3 text-[11px] leading-4 tracking-[0.16em]";

const pillButton =
  "min-h-[44px] gap-1.5 rounded-full px-4 font-title text-[11px] uppercase tracking-[0.12em]";

const Thumb = ({ src, alt }: { src?: string | null; alt: string }) =>
  src ? (
    <img
      src={src}
      alt={alt}
      className="h-20 w-16 shrink-0 rounded-lg bg-muted object-cover"
    />
  ) : (
    <span
      aria-hidden="true"
      className="h-20 w-16 shrink-0 rounded-lg bg-gradient-to-br from-brand-secondary to-brand"
    />
  );

const ListSkeleton = () => (
  <div className="grid gap-3" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="flex gap-4 rounded-xl border border-border/40 p-4"
      >
        <Skeleton className="h-20 w-16" />
        <div className="grid flex-1 content-start gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
    ))}
  </div>
);

const Notice = ({
  children,
  action
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border px-5 py-12 text-center font-body text-sm text-muted-foreground">
    {children}
    {action}
  </div>
);

/* To review ---------------------------------------------------------- */

const ToReviewRow = ({
  item,
  onWrite
}: {
  item: Reviewable;
  onWrite: (item: Reviewable) => void;
}) => {
  const purchased = formatReviewDate(item.purchased_at);
  return (
    <li className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-xl border border-border/40 bg-card p-4 sm:grid-cols-[64px_minmax(0,1fr)_auto]">
      <Thumb src={item.image_url} alt="" />
      <div className="grid min-w-0 gap-0.5">
        <Link
          href={`/${item.slug}`}
          className="truncate font-body-bold text-sm text-foreground underline-offset-4 hover:underline"
        >
          {item.name}
        </Link>
        {item.variant_label && (
          <span className="font-body text-xs text-muted-foreground">
            {item.variant_label}
          </span>
        )}
        <span className="font-body text-xs text-muted-foreground">
          Order {item.order_number}
          {purchased && ` · Purchased ${purchased}`}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => onWrite(item)}
        aria-haspopup="dialog"
        aria-label={`Write a review of ${item.name}`}
        className={cn(
          pillButton,
          "col-span-2 justify-self-start border-foreground/30 sm:col-span-1 sm:justify-self-end"
        )}
      >
        <PenLine aria-hidden="true" />
        Write a review
      </Button>
    </li>
  );
};

/* My reviews --------------------------------------------------------- */

const pointsText = (review: OwnReview) => {
  const parts: string[] = [];
  if (review.points?.awarded)
    parts.push(`${review.points.awarded} points earned`);
  if (review.points?.pending) {
    parts.push(`+${review.points.pending} points once it's live`);
  }
  return parts.join(" · ");
};

const MyReviewRow = ({
  review,
  onEdit
}: {
  review: OwnReview;
  onEdit: (review: OwnReview) => void;
}) => {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmRef = useRef<HTMLParagraphElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const remove = useDeleteReview();
  const date = formatReviewDate(review.published_at);
  const points = pointsText(review);
  const product = review.product;

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  const cancel = () => {
    setConfirming(false);
    setError(null);
    window.requestAnimationFrame(() => deleteButtonRef.current?.focus());
  };

  const confirmDelete = async () => {
    setError(null);
    try {
      await remove.mutateAsync(review.id);
      toast({
        title: "Review deleted",
        description: `Your review of ${product?.name || "this item"} is gone.`
      });
    } catch (err) {
      setError(reviewErrorMessage(err, "delete"));
    }
  };

  return (
    <li className="grid gap-3 rounded-xl border border-border/40 bg-card p-4">
      <div className="flex items-start gap-4">
        <Thumb src={product?.image_url} alt="" />
        <div className="grid min-w-0 flex-1 gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {product?.slug ? (
              <Link
                href={`/${product.slug}`}
                className="truncate font-body-bold text-sm text-foreground underline-offset-4 hover:underline"
              >
                {product.name}
              </Link>
            ) : (
              <span className="truncate font-body-bold text-sm text-foreground">
                {product?.name}
              </span>
            )}
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-[10px] leading-4",
                STATUS_STYLES[review.status]
              )}
            >
              {REVIEW_STATUS_LABELS[review.status]}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-body text-xs text-muted-foreground">
            <Rating value={review.rating} size="sm" />
            {date && <span>{date}</span>}
            {review.variant_label && <span>· {review.variant_label}</span>}
          </div>
          {review.title && (
            <p className="m-0 font-body-bold text-sm text-foreground">
              {review.title}
            </p>
          )}
          {review.body ? (
            <p className="m-0 line-clamp-3 whitespace-pre-line break-words font-body text-sm text-foreground/80">
              {review.body}
            </p>
          ) : (
            <p className="m-0 font-body text-sm text-muted-foreground">
              Rated without a written review.
            </p>
          )}
          {review.photos?.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Your photos">
              {review.photos.map((photo) => (
                <li key={photo.id}>
                  <img
                    src={photo.thumb_url || photo.card_url}
                    alt={
                      photo.alt ||
                      `Your photo of ${product?.name || "the item"}`
                    }
                    className="h-12 w-12 rounded-md bg-muted object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
          <p className="m-0 font-body text-xs text-muted-foreground">
            {review.status_message}
            {points && <span className="text-brand-dark"> · {points}</span>}
          </p>
        </div>
      </div>

      {confirming ? (
        <div
          role="group"
          aria-labelledby={`confirm-delete-${review.id}`}
          className="grid gap-3 rounded-lg border border-red/40 bg-red/5 p-3"
        >
          <p
            id={`confirm-delete-${review.id}`}
            ref={confirmRef}
            tabIndex={-1}
            className="m-0 font-body text-sm text-foreground focus:outline-none"
          >
            Delete this review? This can&apos;t be undone. Points you&apos;ve
            already earned stay.
          </p>
          {error && (
            <p role="alert" className="m-0 font-body text-sm text-red">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={cancel}
              disabled={remove.isLoading}
              className={pillButton}
            >
              Keep it
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={remove.isLoading}
              className={pillButton}
            >
              {remove.isLoading ? "Deleting…" : "Delete review"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onEdit(review)}
            aria-haspopup="dialog"
            aria-label={`Edit your review of ${product?.name || "this item"}`}
            className={cn(pillButton, "border-foreground/30")}
          >
            <PenLine aria-hidden="true" />
            Edit
          </Button>
          <Button
            ref={deleteButtonRef}
            type="button"
            variant="ghost"
            onClick={() => setConfirming(true)}
            aria-label={`Delete your review of ${product?.name || "this item"}`}
            className={cn(
              pillButton,
              "text-red hover:bg-red/10 hover:text-red"
            )}
          >
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        </div>
      )}
    </li>
  );
};

/* Store review (M5) --------------------------------------------------- */

/**
 * The customer's store review (from `/store_reviews/form`), with Edit, at the
 * top of "My reviews". With no store review yet, eligible customers get a
 * "Review DNA" prompt. Store reviews can't be deleted (no endpoint), and
 * earn no points. Renders nothing while store reviews are off (503).
 */
const StoreReviewRow = () => {
  const formQuery = useStoreReviewForm();
  const [open, setOpen] = useState(false);
  const form = formQuery.data;
  if (!form) return null;
  const review = form.existing_review;
  if (!review && !form.eligible) return null;

  const sheet = (
    <StoreReviewComposerSheet open={open} onOpenChange={setOpen} form={form} />
  );

  if (!review) {
    return (
      <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-4">
        <p className="m-0 font-body text-sm text-muted-foreground">
          How was shopping with {STORE_NAME}? Tell other customers.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className={cn(pillButton, "border-foreground/30")}
        >
          <PenLine aria-hidden="true" />
          Review {STORE_NAME}
        </Button>
        {sheet}
      </li>
    );
  }

  const date = formatReviewDate(review.published_at);
  return (
    <li
      className="grid gap-3 rounded-xl border border-border/40 bg-card p-4"
      data-own-store-review
    >
      <div className="flex items-start gap-4">
        <Thumb alt="" />
        <div className="grid min-w-0 flex-1 gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/reviews"
              className="truncate font-body-bold text-sm text-foreground underline-offset-4 hover:underline"
            >
              Your review of {STORE_NAME}
            </Link>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-[10px] leading-4",
                STATUS_STYLES[review.status]
              )}
            >
              {REVIEW_STATUS_LABELS[review.status]}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-body text-xs text-muted-foreground">
            <Rating value={review.rating} size="sm" />
            {date && <span>{date}</span>}
          </div>
          {review.title && (
            <p className="m-0 font-body-bold text-sm text-foreground">
              {review.title}
            </p>
          )}
          {review.body ? (
            <p className="m-0 line-clamp-3 whitespace-pre-line break-words font-body text-sm text-foreground/80">
              {review.body}
            </p>
          ) : (
            <p className="m-0 font-body text-sm text-muted-foreground">
              Rated without a written review.
            </p>
          )}
          <p className="m-0 font-body text-xs text-muted-foreground">
            {review.status_message}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Edit your review of ${STORE_NAME}`}
          className={cn(pillButton, "border-foreground/30")}
        >
          <PenLine aria-hidden="true" />
          Edit
        </Button>
      </div>
      {sheet}
    </li>
  );
};

/* Page body ---------------------------------------------------------- */

interface AccountReviewsProps {
  initialTab?: AccountReviewsTab;
  onTabChange?: (tab: AccountReviewsTab) => void;
}

/**
 * `/account/reviews`: "To review" (received items without a review) and
 * "My reviews" (own reviews in any status, with edit and delete).
 */
export const AccountReviews = ({
  initialTab = "to-review",
  onTabChange
}: AccountReviewsProps) => {
  const [tab, setTab] = useState<AccountReviewsTab>(initialTab);
  useEffect(() => setTab(initialTab), [initialTab]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState<ReviewTarget | null>(null);

  const reviewables = useReviewables();
  const myReviews = useMyReviews();

  const toReview = useMemo(
    () =>
      (reviewables.data?.data || []).filter((item) => !item.existing_review),
    [reviewables.data]
  );
  const loadedMine = useMemo(
    () => (myReviews.data?.pages || []).flatMap((page) => page.data || []),
    [myReviews.data]
  );
  // A store review (no product), if the API lists one here, is shown by
  // StoreReviewRow instead.
  const mine = useMemo(
    () => loadedMine.filter((review) => !!review.product),
    [loadedMine]
  );
  const mineTotal =
    (myReviews.data?.pages?.[myReviews.data.pages.length - 1]?.meta
      ?.total_count ?? loadedMine.length) -
    (loadedMine.length - mine.length);

  const openComposer = (next: ReviewTarget) => {
    setTarget(next);
    setSheetOpen(true);
  };

  const changeTab = (value: string) => {
    const next = value === "mine" ? "mine" : "to-review";
    setTab(next);
    onTabChange?.(next);
  };

  const renderToReview = () => {
    if (reviewables.isLoading) return <ListSkeleton />;
    if (reviewables.isError) {
      return (
        <Notice
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => reviewables.refetch()}
            >
              Try again
            </Button>
          }
        >
          <p role="alert" className="m-0">
            {reviewErrorMessage(reviewables.error, "load")}
          </p>
        </Notice>
      );
    }
    if (!toReview.length) {
      return (
        <Notice>
          <CheckCircle2 className="h-8 w-8 text-brand" aria-hidden="true" />
          <p className="m-0">
            You&apos;re all caught up. Items show up here once they&apos;ve
            shipped.
          </p>
        </Notice>
      );
    }
    return (
      <ul className="m-0 grid list-none gap-3 p-0">
        {toReview.map((item) => (
          <ToReviewRow
            key={item.line_item_id}
            item={item}
            onWrite={(row) => openComposer(reviewTargetFromReviewable(row))}
          />
        ))}
      </ul>
    );
  };

  const renderMine = () => {
    if (myReviews.isLoading) return <ListSkeleton />;
    if (myReviews.isError && !mine.length) {
      return (
        <Notice
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => myReviews.refetch()}
            >
              Try again
            </Button>
          }
        >
          <p role="alert" className="m-0">
            {reviewErrorMessage(myReviews.error, "load")}
          </p>
        </Notice>
      );
    }
    if (!mine.length) {
      return (
        <div className="grid gap-3">
          <ul className="m-0 grid list-none gap-3 p-0 empty:hidden">
            <StoreReviewRow />
          </ul>
          <Notice>
            <p className="m-0">
              You haven&apos;t written any product reviews yet.
            </p>
          </Notice>
        </div>
      );
    }
    return (
      <div className="grid gap-4">
        <ul className="m-0 grid list-none gap-3 p-0">
          <StoreReviewRow />
          {mine.map((review) => (
            <MyReviewRow
              key={review.id}
              review={review}
              onEdit={(row) =>
                openComposer({
                  productId: row.product?.slug || row.product?.id,
                  name: row.product?.name,
                  imageUrl: row.product?.image_url,
                  variantLabel: row.variant_label
                })
              }
            />
          ))}
        </ul>
        {myReviews.hasNextPage && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => myReviews.fetchNextPage()}
              disabled={myReviews.isFetchingNextPage}
              className={pillButton}
            >
              {myReviews.isFetchingNextPage ? "Loading…" : "Show more"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid gap-4">
      <h2 className="m-0 font-title text-xl uppercase tracking-wider text-foreground">
        Reviews
      </h2>
      <Tabs value={tab} onValueChange={changeTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="to-review" className={TAB_CLASS}>
            To review
            {reviewables.data && (
              <span className="ml-1.5 tabular-nums">({toReview.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mine" className={TAB_CLASS}>
            My reviews
            {myReviews.data && (
              <span className="ml-1.5 tabular-nums">({mineTotal})</span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="to-review">{renderToReview()}</TabsContent>
        <TabsContent value="mine">{renderMine()}</TabsContent>
      </Tabs>
      <ReviewComposerSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        target={target}
      />
    </div>
  );
};

export default AccountReviews;

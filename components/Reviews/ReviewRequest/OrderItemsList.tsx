import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button, Rating } from "@components/ui";
import { cn } from "@lib/utils";
import type { ReviewRequestItem } from "../../../types/reviews";
import { reviewOf, SubmittedReviews } from "./flow";

interface OrderItemsListProps {
  items: ReviewRequestItem[];
  submitted: SubmittedReviews;
  /** The item open in the composer, marked "Reviewing now". */
  currentId?: number | null;
  onSelect: (item: ReviewRequestItem) => void;
  /** Link item names to their product pages (the "All done" screen). */
  linkProducts?: boolean;
  className?: string;
}

/**
 * Compact list of the order's items: "Reviewed ✓" with Edit for items that
 * have a review, Review for the rest (including skipped ones).
 */
export const OrderItemsList = ({
  items,
  submitted,
  currentId,
  onSelect,
  linkProducts = false,
  className
}: OrderItemsListProps) => (
  <ul className={cn("m-0 grid list-none gap-2 p-0", className)}>
    {items.map((item) => {
      const review = reviewOf(item, submitted);
      const current = item.line_item_id === currentId;
      return (
        <li
          key={item.line_item_id}
          aria-current={current ? "step" : undefined}
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-xl border p-3",
            current ? "border-brand bg-brand/5" : "border-border"
          )}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt=""
              className="h-12 w-10 shrink-0 rounded-md bg-muted object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="h-12 w-10 shrink-0 rounded-md bg-gradient-to-br from-brand-secondary to-brand"
            />
          )}
          <div className="grid min-w-0 flex-1 gap-0.5">
            {linkProducts && item.slug ? (
              <Link
                href={`/${item.slug}`}
                className="truncate font-body-bold text-sm text-foreground underline-offset-4 hover:underline"
              >
                {item.name}
              </Link>
            ) : (
              <span className="truncate font-body-bold text-sm text-foreground">
                {item.name}
              </span>
            )}
            {current ? (
              <span className="font-body text-xs text-brand-dark">
                Reviewing now
              </span>
            ) : review ? (
              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-body text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-foreground">
                  Reviewed
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <Rating
                  value={review.rating}
                  size="xs"
                  label={`You rated it ${review.rating} out of 5`}
                />
              </span>
            ) : (
              item.variant_label && (
                <span className="truncate font-body text-xs text-muted-foreground">
                  {item.variant_label}
                </span>
              )
            )}
          </div>
          {!current && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-[44px] shrink-0 rounded-full px-4 font-title text-[11px] uppercase tracking-[0.12em]"
              aria-label={`${review ? "Edit your review of" : "Review"} ${
                item.name
              }`}
              onClick={() => onSelect(item)}
            >
              {review ? "Edit" : "Review"}
            </Button>
          )}
        </li>
      );
    })}
  </ul>
);

export default OrderItemsList;

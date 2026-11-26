import React from "react";
import { cn } from "@lib/utils";
import type { ReviewSummaryPhoto } from "../../types/reviews";

interface ReviewMediaStripProps {
  photos: ReviewSummaryPhoto[];
  /** Total photos in the scope; drives the "+N" tile. */
  totalCount: number;
  productName?: string;
  onOpen: (index: number) => void;
  /** Called by the "+N" tile when every loaded photo is already visible. */
  onShowAll?: () => void;
}

const DESKTOP_TILES = 6;
const MOBILE_TILES = 3;

/** Latest customer photos; tiles open the lightbox. */
export const ReviewMediaStrip = ({
  photos,
  totalCount,
  productName,
  onOpen,
  onShowAll
}: ReviewMediaStripProps) => {
  if (!photos.length) return null;
  const total = Math.max(totalCount || 0, photos.length);
  const visible = photos.slice(0, DESKTOP_TILES);
  const moreDesktop = total - Math.min(photos.length, DESKTOP_TILES);
  const moreMobile = total - Math.min(photos.length, MOBILE_TILES);

  const openMore = (shown: number) => {
    if (photos.length > shown) onOpen(shown);
    else onShowAll?.();
  };

  const moreTile = (count: number, shown: number, className: string) =>
    count > 0 ? (
      <button
        type="button"
        onClick={() => openMore(shown)}
        className={cn(
          "aspect-square w-full items-center justify-center rounded-lg bg-muted font-title text-sm tabular-nums text-muted-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
          className
        )}
        aria-label={`See ${count} more customer photos`}
      >
        +{count}
      </button>
    ) : null;

  return (
    <div
      className="grid grid-cols-4 gap-2 sm:grid-cols-7"
      role="group"
      aria-label="Customer photos"
    >
      {visible.map((photo, index) => {
        const alt =
          photo.alt ||
          (productName ? `Customer photo of ${productName}` : "Customer photo");
        return (
          <button
            key={photo.id}
            type="button"
            onClick={() => onOpen(index)}
            className={cn(
              "relative aspect-square w-full overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
              index >= MOBILE_TILES ? "hidden sm:block" : "block"
            )}
            aria-label={`${alt} (photo ${index + 1} of ${
              photos.length
            }, opens a larger view)`}
          >
            <img
              src={photo.thumb_url || photo.card_url}
              alt={alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        );
      })}
      {moreTile(moreMobile, MOBILE_TILES, "flex sm:hidden")}
      {moreTile(moreDesktop, DESKTOP_TILES, "hidden sm:flex")}
    </div>
  );
};

export default ReviewMediaStrip;

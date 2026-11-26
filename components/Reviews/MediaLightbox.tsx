import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@components/ui";
import type { ReviewPhoto } from "../../types/reviews";

export interface LightboxState {
  photos: ReviewPhoto[];
  index: number;
  /** Used for alt text fallbacks. */
  title?: string;
}

interface MediaLightboxProps {
  state: LightboxState | null;
  onClose: () => void;
  productName?: string;
}

const photoAlt = (photo: ReviewPhoto, productName?: string) =>
  photo.alt ||
  (productName ? `Customer photo of ${productName}` : "Customer photo");

/**
 * Full-size customer photos in a dialog with the embla carousel. Arrow keys
 * move between photos and are kept from reaching the PDP's own arrow-key
 * product navigation; Escape closes (Radix).
 */
export const MediaLightbox = ({
  state,
  onClose,
  productName
}: MediaLightboxProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const photos = state?.photos || [];

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (state) setCurrent(state.index);
  }, [state]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    // Keep RetailProductDetails' window-level arrow navigation from firing.
    event.stopPropagation();
    // The carousel handles arrows itself when focus is inside it.
    if (event.defaultPrevented || !api) return;
    event.preventDefault();
    if (event.key === "ArrowLeft") api.scrollPrev();
    else api.scrollNext();
  };

  return (
    <Dialog open={!!state} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[92vh] w-[calc(100vw-2rem)] max-w-3xl gap-3 p-4 sm:p-6"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="pr-10 text-title-sm">
          Customer photos
        </DialogTitle>
        <DialogDescription className="sr-only">
          Use the arrow keys or the previous and next buttons to browse.
        </DialogDescription>
        {state && photos.length > 0 && (
          <Carousel
            setApi={setApi}
            opts={{ startIndex: state.index, loop: photos.length > 1 }}
            className="w-full"
            aria-label="Customer photos"
          >
            <CarouselContent>
              {photos.map((photo, index) => (
                <CarouselItem
                  key={`${photo.id}-${index}`}
                  aria-label={`${index + 1} of ${photos.length}`}
                >
                  <div className="flex h-[min(70vh,640px)] items-center justify-center overflow-hidden rounded-lg bg-muted">
                    <img
                      src={photo.full_url || photo.card_url}
                      alt={photoAlt(photo, productName)}
                      className="max-h-full max-w-full object-contain"
                      loading={index === state.index ? "eager" : "lazy"}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        )}
        {photos.length > 1 && (
          <p
            className="m-0 text-center font-title text-xs tabular-nums text-muted-foreground"
            aria-live="polite"
          >
            {current + 1} / {photos.length}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MediaLightbox;

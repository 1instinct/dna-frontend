import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@lib/utils";
import { MediaItem } from "@lib/productMedia";
import {
  ProductMedia,
  usePrefersReducedMotion,
  useSaveData
} from "@components/ProductMedia";

interface ProductGalleryProps {
  /** Built by buildGallery (lib/productMedia): videos first, then images. */
  items: MediaItem[];
}

/**
 * PDP gallery. Only the selected slide may play. Hover zoom and the lightbox
 * work for images (GIFs included) and are off for video slides. Thumbnails
 * are always static posters; the lightbox shows the animated GIF.
 */
export const ProductGallery: React.FC<ProductGalleryProps> = ({ items }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const lightboxDialogRef = useRef<HTMLDivElement>(null);
  // Where focus was when the lightbox opened; it goes back there on close.
  const lightboxReturnFocus = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const saveData = useSaveData();

  // The lightbox holds images only; map between its indexes and the gallery's.
  const lightboxToMain = useMemo(
    () =>
      items
        .map((item, i) => (item.kind === "video" ? -1 : i))
        .filter((i) => i >= 0),
    [items]
  );
  const mainToLightbox = useCallback(
    (main: number) => lightboxToMain.indexOf(main),
    [lightboxToMain]
  );

  // Main gallery carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  // Lightbox carousel
  const [lightboxRef, lightboxApi] = useEmblaCarousel({
    loop: true,
    startIndex: Math.max(0, mainToLightbox(selectedIndex))
  });

  const current = items[selectedIndex];
  const currentIsVideo = current?.kind === "video";

  // A new list (variant switch) starts from the first slide.
  const itemsKey = items.map((i) => i.key).join("|");
  useEffect(() => {
    setSelectedIndex(0);
    emblaApi?.reInit();
    emblaApi?.scrollTo(0, true);
  }, [itemsKey, emblaApi]);

  // Sync main carousel selection
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Sync lightbox when opened
  useEffect(() => {
    if (lightboxOpen && lightboxApi) {
      const idx = Math.max(0, mainToLightbox(selectedIndex));
      lightboxApi.scrollTo(idx, true);
      setLightboxIndex(idx);
    }
  }, [lightboxOpen, lightboxApi, selectedIndex, mainToLightbox]);

  // Sync lightbox selection back
  useEffect(() => {
    if (!lightboxApi) return;
    const onSelect = () => {
      const idx = lightboxApi.selectedScrollSnap();
      setLightboxIndex(idx);
      const main = lightboxToMain[idx];
      if (main !== undefined) {
        setSelectedIndex(main);
        emblaApi?.scrollTo(main, true);
      }
    };
    lightboxApi.on("select", onSelect);
    return () => {
      lightboxApi.off("select", onSelect);
    };
  }, [lightboxApi, emblaApi, lightboxToMain]);

  // Keyboard navigation. The lightbox is modal: Tab stays inside it.
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") lightboxApi?.scrollPrev();
      else if (e.key === "ArrowRight") lightboxApi?.scrollNext();
      else if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "Tab" && lightboxDialogRef.current) {
        const focusable = Array.from(
          lightboxDialogRef.current.querySelectorAll<HTMLElement>(
            "button:not([disabled])"
          )
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const inside = lightboxDialogRef.current.contains(
          document.activeElement
        );
        if (e.shiftKey && (document.activeElement === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last || !inside)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, lightboxApi]);

  // Focus moves into the lightbox when it opens and back when it closes.
  useEffect(() => {
    if (lightboxOpen) {
      lightboxCloseRef.current?.focus();
    } else if (lightboxReturnFocus.current) {
      lightboxReturnFocus.current.focus();
      lightboxReturnFocus.current = null;
    }
  }, [lightboxOpen]);

  const openLightbox = useCallback(() => {
    if (typeof document !== "undefined") {
      lightboxReturnFocus.current = document.activeElement as HTMLElement;
    }
    setLightboxOpen(true);
  }, []);

  // No zoom on a video slide.
  useEffect(() => {
    if (currentIsVideo) setIsZoomed(false);
  }, [currentIsVideo]);

  const scrollTo = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!currentIsVideo) setIsZoomed(true);
  }, [currentIsVideo]);
  const handleMouseLeave = useCallback(() => setIsZoomed(false), []);

  if (!items.length) return null;

  const motionAllowed = !reducedMotion && !saveData;
  const lightboxItems = lightboxToMain.map((i) => items[i]);
  const canExpand = lightboxItems.length > 0;
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main carousel with hover zoom */}
        <div
          ref={mainImageRef}
          className={cn(
            "group relative overflow-hidden rounded-xl bg-muted",
            currentIsVideo ? "cursor-default" : "cursor-zoom-in"
          )}
          onMouseMove={currentIsVideo ? undefined : handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Embla carousel */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {items.map((item, index) => {
                const zoomable = item.kind !== "video";
                const selected = index === selectedIndex;
                const media = (
                  <ProductMedia
                    media={item}
                    surface="pdp"
                    active={index === selectedIndex}
                    priority={index === 0}
                    className="relative z-10 w-full overflow-hidden"
                    mediaClassName="w-full object-contain"
                    mediaStyle={
                      zoomable
                        ? {
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            transform:
                              isZoomed && index === selectedIndex
                                ? "scale(2)"
                                : "scale(1)",
                            transition: isZoomed
                              ? "transform 0.1s ease-out"
                              : "transform 0.3s ease-out"
                          }
                        : undefined
                    }
                    draggable={false}
                  />
                );
                return (
                  <div
                    key={item.key}
                    className="min-w-0 shrink-0 grow-0 basis-full"
                    aria-hidden={selected ? undefined : true}
                  >
                    {/* An image slide is a button that opens the lightbox;
                        only the selected one is in the tab order. Video
                        slides keep their own native controls. */}
                    {zoomable && canExpand ? (
                      <button
                        type="button"
                        tabIndex={selected ? 0 : -1}
                        onClick={openLightbox}
                        aria-label={`Expand image ${index + 1} of ${
                          items.length
                        }`}
                        // The ring is drawn on ::after, above the media
                        // (z-10), which would otherwise cover an inset ring.
                        className="relative block w-full cursor-zoom-in p-0 text-left after:pointer-events-none focus-visible:outline-none focus-visible:after:absolute focus-visible:after:inset-0 focus-visible:after:z-20 focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
                      >
                        {media}
                      </button>
                    ) : (
                      media
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prev/Next arrows (desktop) */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  emblaApi?.scrollPrev();
                }}
                aria-label="Previous image"
                className={cn(
                  "absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 opacity-0 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white group-focus-within:opacity-100 group-hover:opacity-100",
                  focusRing
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  emblaApi?.scrollNext();
                }}
                aria-label="Next image"
                className={cn(
                  "absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 opacity-0 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white group-focus-within:opacity-100 group-hover:opacity-100",
                  focusRing
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Zoom hint (images only) */}
          {!currentIsVideo && (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 font-body text-xs text-white/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
            >
              <ZoomIn className="h-3.5 w-3.5" />
              Click to expand
            </div>
          )}
        </div>

        {/* Thumbnail strip: static posters only. The padding (offset by the
            negative margin) keeps focus rings clear of the scroll clip. */}
        {items.length > 1 && (
          <div className="-mx-1 -mt-1 flex gap-2 overflow-x-auto p-1">
            {items.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`Show ${
                  item.kind === "video" ? "video" : "image"
                } ${index + 1} of ${items.length}`}
                aria-current={selectedIndex === index ? "true" : undefined}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-all duration-300",
                  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selectedIndex === index
                    ? "border-primary"
                    : "border-border opacity-50 hover:opacity-80"
                )}
              >
                {(item.thumb || item.poster) && (
                  <img
                    src={item.thumb || item.poster || ""}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                )}
                {item.kind === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-5 w-5 fill-white/80 text-white/80" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox (images only) */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            ref={lightboxDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            className="fixed inset-0 z-[100] flex items-center justify-center"
            // A click on the backdrop itself closes it; clicks on the image,
            // arrows and thumbnails land on their own elements.
            onClick={(e: React.MouseEvent) => {
              if (e.target === e.currentTarget) setLightboxOpen(false);
            }}
          >
            {/* Backdrop: lets clicks through to the dialog above */}
            <div className="pointer-events-none absolute inset-0 bg-black/90 backdrop-blur-xl" />

            {/* Close button */}
            <button
              ref={lightboxCloseRef}
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close image viewer"
              className={cn(
                "absolute right-5 top-5 z-[110] flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white",
                focusRing
              )}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Lightbox carousel */}
            <div className="relative z-[105] w-full max-w-[90vw] max-h-[85vh]">
              <div ref={lightboxRef} className="overflow-hidden">
                <div className="flex">
                  {lightboxItems.map((item, index) => {
                    // Animated GIF only on the visible slide, and only when
                    // motion is allowed; otherwise its static poster.
                    const animated =
                      item.kind === "gif" &&
                      motionAllowed &&
                      index === lightboxIndex;
                    const src = animated
                      ? item.src
                      : item.kind === "gif"
                      ? item.poster
                      : item.src || item.poster;
                    return (
                      <div
                        key={item.key}
                        className="flex min-w-0 shrink-0 grow-0 basis-full items-center justify-center"
                        aria-hidden={index === lightboxIndex ? undefined : true}
                      >
                        {src && (
                          <img
                            src={src}
                            alt={item.alt}
                            className="max-h-[85vh] max-w-full rounded-xl object-contain"
                            draggable={false}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lightbox prev/next */}
              {lightboxItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => lightboxApi?.scrollPrev()}
                    aria-label="Previous image"
                    className={cn(
                      "absolute left-4 top-1/2 z-[110] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white",
                      focusRing
                    )}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => lightboxApi?.scrollNext()}
                    aria-label="Next image"
                    className={cn(
                      "absolute right-4 top-1/2 z-[110] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white",
                      focusRing
                    )}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox thumbnails */}
            {lightboxItems.length > 1 && (
              <div className="absolute bottom-6 z-[110] flex gap-2">
                {lightboxItems.map((item, index) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => lightboxApi?.scrollTo(index)}
                    aria-label={`Show image ${index + 1} of ${
                      lightboxItems.length
                    }`}
                    aria-current={lightboxIndex === index ? "true" : undefined}
                    className={cn(
                      "h-14 w-14 overflow-hidden rounded-lg border-2 transition-all duration-300",
                      focusRing,
                      lightboxIndex === index
                        ? "border-primary"
                        : "border-white/10 opacity-40 hover:opacity-70"
                    )}
                  >
                    <img
                      src={item.thumb || item.poster || ""}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

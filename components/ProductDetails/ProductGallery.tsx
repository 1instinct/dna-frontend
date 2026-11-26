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

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") lightboxApi?.scrollPrev();
      else if (e.key === "ArrowRight") lightboxApi?.scrollNext();
      else if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, lightboxApi]);

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
          onClick={() => {
            if (!currentIsVideo && lightboxItems.length) setLightboxOpen(true);
          }}
        >
          {/* Embla carousel */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {items.map((item, index) => {
                const zoomable = item.kind !== "video";
                return (
                  <div
                    key={item.key}
                    className="min-w-0 shrink-0 grow-0 basis-full"
                  >
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prev/Next arrows (desktop) */}
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  emblaApi?.scrollPrev();
                }}
                aria-label="Previous"
                className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 opacity-0 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  emblaApi?.scrollNext();
                }}
                aria-label="Next"
                className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 opacity-0 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Zoom hint (images only) */}
          {!currentIsVideo && (
            <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 font-body text-xs text-white/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
              <ZoomIn className="h-3.5 w-3.5" />
              Click to expand
            </div>
          )}
        </div>

        {/* Thumbnail strip: static posters only */}
        {items.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {items.map((item, index) => (
              <button
                key={item.key}
                onClick={() => scrollTo(index)}
                aria-label={
                  item.kind === "video"
                    ? `Video ${index + 1}`
                    : `Image ${index + 1}`
                }
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-all duration-300",
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
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="absolute right-5 top-5 z-[110] flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Lightbox carousel */}
            <div
              className="relative z-[105] w-full max-w-[90vw] max-h-[85vh]"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
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
                    onClick={() => lightboxApi?.scrollPrev()}
                    aria-label="Previous"
                    className="absolute left-4 top-1/2 z-[110] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => lightboxApi?.scrollNext()}
                    aria-label="Next"
                    className="absolute right-4 top-1/2 z-[110] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox thumbnails */}
            {lightboxItems.length > 1 && (
              <div
                className="absolute bottom-6 z-[110] flex gap-2"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                {lightboxItems.map((item, index) => (
                  <button
                    key={item.key}
                    onClick={() => lightboxApi?.scrollTo(index)}
                    aria-label={`Image ${index + 1}`}
                    className={cn(
                      "h-14 w-14 overflow-hidden rounded-lg border-2 transition-all duration-300",
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

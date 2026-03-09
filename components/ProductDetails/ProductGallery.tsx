import React, { useState, useRef, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@lib/utils";

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);

  // Main gallery carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  // Lightbox carousel
  const [lightboxRef, lightboxApi] = useEmblaCarousel({
    loop: true,
    startIndex: selectedIndex
  });

  const currentImage = images[selectedIndex];

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
      lightboxApi.scrollTo(selectedIndex, true);
    }
  }, [lightboxOpen, lightboxApi, selectedIndex]);

  // Sync lightbox selection back
  useEffect(() => {
    if (!lightboxApi) return;
    const onSelect = () => {
      const idx = lightboxApi.selectedScrollSnap();
      setSelectedIndex(idx);
      emblaApi?.scrollTo(idx, true);
    };
    lightboxApi.on("select", onSelect);
    return () => {
      lightboxApi.off("select", onSelect);
    };
  }, [lightboxApi, emblaApi]);

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

  const scrollTo = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mainImageRef.current) return;
      const rect = mainImageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    []
  );

  const handleMouseEnter = useCallback(() => setIsZoomed(true), []);
  const handleMouseLeave = useCallback(() => setIsZoomed(false), []);

  if (!images.length) return null;

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main carousel with hover zoom */}
        <div
          ref={mainImageRef}
          className="group relative cursor-zoom-in overflow-hidden rounded-xl bg-surface-deep"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => setLightboxOpen(true)}
        >
          {/* Neon glow backdrop */}
          <div
            className="pointer-events-none absolute inset-0 z-0 rounded-xl"
            style={{
              background:
                "radial-gradient(circle at center, rgba(0, 255, 255, 0.06) 0%, transparent 70%)"
            }}
          />

          {/* Embla carousel */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {images.map((image, index) => (
                <div key={index} className="min-w-0 shrink-0 grow-0 basis-full">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="relative z-10 w-full object-contain"
                    style={{
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transform:
                        isZoomed && index === selectedIndex
                          ? "scale(2)"
                          : "scale(1)",
                      transition: isZoomed
                        ? "transform 0.1s ease-out"
                        : "transform 0.3s ease-out"
                    }}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Prev/Next arrows (desktop) */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  emblaApi?.scrollPrev();
                }}
                className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 opacity-0 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  emblaApi?.scrollNext();
                }}
                className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 opacity-0 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 font-micro5 text-xs text-white/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <ZoomIn className="h-3.5 w-3.5" />
            Click to expand
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300",
                  selectedIndex === index
                    ? "border-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.35)]"
                    : "border-glass-border opacity-50 hover:opacity-80 hover:border-white/30"
                )}
              >
                <img
                  src={image.src}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
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
            <div
              className="absolute inset-0"
              style={{
                background: "rgba(5, 0, 15, 0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)"
              }}
            />

            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
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
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="flex min-w-0 shrink-0 grow-0 basis-full items-center justify-center"
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="max-h-[85vh] max-w-full rounded-xl object-contain"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Lightbox prev/next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => lightboxApi?.scrollPrev()}
                    className="absolute left-4 top-1/2 z-[110] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => lightboxApi?.scrollNext()}
                    className="absolute right-4 top-1/2 z-[110] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox thumbnails */}
            {images.length > 1 && (
              <div
                className="absolute bottom-6 z-[110] flex gap-2"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedIndex(index);
                      lightboxApi?.scrollTo(index);
                    }}
                    className={cn(
                      "h-14 w-14 overflow-hidden rounded-lg border-2 transition-all duration-300",
                      selectedIndex === index
                        ? "border-neon-cyan shadow-[0_0_12px_rgba(0,255,255,0.4)]"
                        : "border-white/10 opacity-40 hover:opacity-70"
                    )}
                  >
                    <img
                      src={image.src}
                      alt={`Thumbnail ${index + 1}`}
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

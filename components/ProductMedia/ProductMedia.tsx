import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { cn } from "@lib/utils";
import { MediaItem, playbackDecision } from "@lib/productMedia";
import {
  useInView,
  usePrefersReducedMotion,
  useSaveData
} from "./usePlaybackEnv";

export interface ProductMediaProps {
  media: MediaItem | null | undefined;
  /** "grid" for cards and shelves, "pdp" for gallery slides. */
  surface?: "grid" | "pdp";
  /** PDP only: this is the selected slide. */
  active?: boolean;
  /** Wrapper classes (size and position). */
  className?: string;
  /** Applied to the poster and every layer over it (object-fit, hover scale). */
  mediaClassName?: string;
  /** Applied to the poster and every layer over it (e.g. gallery zoom). */
  mediaStyle?: CSSProperties;
  /** Shown when there is no media at all. */
  placeholder?: React.ReactNode;
  /** Load the poster eagerly (above-the-fold hero). */
  priority?: boolean;
  /** How far outside the viewport motion may start. */
  rootMargin?: string;
  draggable?: boolean;
  /**
   * The media sits inside a link or button that already names the product:
   * empty alt so screen readers do not read the name twice.
   */
  decorative?: boolean;
}

/**
 * Poster first; motion only while on screen.
 *
 * - The static poster always renders (lazy unless `priority`), so server and
 *   client markup match and a card is never blank.
 * - A GIF is layered over its poster only while it may animate and is removed
 *   (back to the poster) when it scrolls away.
 * - A video element is created the first time it may play (preload="none"
 *   until then), plays muted/looped/inline while visible, pauses off screen,
 *   and fades in only once actually playing. Any load error drops it and the
 *   poster stays.
 * - Reduced motion and save-data: poster only. On the PDP the selected video
 *   always has native controls: to opt in, to pause, or to start it when the
 *   browser refuses autoplay.
 */
export const ProductMedia: React.FC<ProductMediaProps> = ({
  media,
  surface = "grid",
  active = true,
  className,
  mediaClassName,
  mediaStyle,
  placeholder = null,
  priority = false,
  rootMargin,
  draggable,
  decorative = false
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useInView(wrapperRef, rootMargin);
  const reducedMotion = usePrefersReducedMotion();
  const saveData = useSaveData();

  const [gifFailed, setGifFailed] = useState(false);
  const [gifLoaded, setGifLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoArmed, setVideoArmed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // New media (e.g. variant switch): start over from the poster.
  const mediaKey = media?.key;
  useEffect(() => {
    setGifFailed(false);
    setGifLoaded(false);
    setVideoFailed(false);
    setVideoArmed(false);
    setVideoPlaying(false);
  }, [mediaKey]);

  const kind = media?.kind || "image";
  const { animate, showControls } = playbackDecision({
    kind,
    surface,
    visible,
    active,
    reducedMotion,
    saveData
  });

  const isVideo = kind === "video" && !!media?.src && !videoFailed;
  const showGif = kind === "gif" && animate && !gifFailed && !!media?.src;

  // Create the <video> the first time it may play or offer controls.
  useEffect(() => {
    if (isVideo && (animate || (showControls && visible))) setVideoArmed(true);
  }, [isVideo, animate, showControls, visible]);

  // Drive play/pause from the decision.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoArmed) return;
    if (animate) {
      el.muted = true;
      const p = el.play();
      if (p && typeof p.catch === "function") {
        // Autoplay refused (or aborted by a pause): stay on the poster.
        p.catch(() => setVideoPlaying(false));
      }
    } else if (!(showControls && visible)) {
      el.pause();
    }
    // mediaKey: a new src on the same element resets it to paused, so ask
    // again even when nothing else changed.
  }, [animate, showControls, visible, videoArmed, mediaKey]);

  // Never leave a GIF's loaded flag set across hide/show.
  useEffect(() => {
    if (!showGif) setGifLoaded(false);
  }, [showGif]);

  const layer = cn("absolute inset-0 h-full w-full", mediaClassName);

  if (!media || (!media.poster && !isVideo)) {
    return (
      <div ref={wrapperRef} className={cn("relative", className)}>
        {placeholder}
      </div>
    );
  }

  const videoVisible = showControls || videoPlaying;

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      data-media-kind={kind}
      data-media-animating={showGif || videoPlaying ? "true" : "false"}
    >
      {media.poster ? (
        <img
          src={media.poster}
          alt={decorative ? "" : media.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={mediaClassName}
          style={mediaStyle}
          draggable={draggable}
        />
      ) : (
        // A video with no poster: hold the space until it plays.
        <div className={cn("aspect-video w-full", mediaClassName)} />
      )}

      {showGif && media.src && (
        <img
          src={media.src}
          alt=""
          aria-hidden="true"
          decoding="async"
          className={cn(
            layer,
            "transition-opacity duration-300",
            gifLoaded ? "opacity-100" : "opacity-0"
          )}
          style={mediaStyle}
          onLoad={() => setGifLoaded(true)}
          onError={() => setGifFailed(true)}
          draggable={draggable}
        />
      )}

      {isVideo && videoArmed && media.src && (
        <video
          ref={videoRef}
          src={media.src}
          poster={media.poster || undefined}
          muted
          loop
          playsInline
          preload="none"
          controls={showControls}
          aria-label={decorative ? undefined : media.alt}
          aria-hidden={decorative || undefined}
          className={cn(
            layer,
            "transition-opacity duration-300",
            // Opaque, so a letterboxed (object-contain) video never shows
            // a differently-sized poster around it.
            "bg-background",
            videoVisible ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          style={mediaStyle}
          onPlaying={() => setVideoPlaying(true)}
          onPause={() => setVideoPlaying(false)}
          onError={() => {
            setVideoPlaying(false);
            setVideoFailed(true);
          }}
        />
      )}
    </div>
  );
};

export default ProductMedia;

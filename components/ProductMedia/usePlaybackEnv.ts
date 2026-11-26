import { RefObject, useEffect, useState } from "react";

// Browser signals for media playback. Every hook starts from the server-safe
// value (not visible, no preference) and only reads the browser in an effect,
// so server markup and the first client render always match.

type Listener = (visible: boolean) => void;

interface SharedObserver {
  io: IntersectionObserver;
  listeners: Map<Element, Listener>;
}

// One IntersectionObserver per rootMargin, shared by every ProductMedia on the
// page, instead of one observer per card.
const observers = new Map<string, SharedObserver>();

function observe(
  el: Element,
  rootMargin: string,
  listener: Listener
): () => void {
  let shared = observers.get(rootMargin);
  if (!shared) {
    const listeners = new Map<Element, Listener>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          listeners.get(entry.target)?.(entry.isIntersecting);
        }
      },
      { rootMargin, threshold: 0 }
    );
    shared = { io, listeners };
    observers.set(rootMargin, shared);
  }
  shared.listeners.set(el, listener);
  shared.io.observe(el);
  const current = shared;
  return () => {
    current.listeners.delete(el);
    current.io.unobserve(el);
    if (current.listeners.size === 0) {
      current.io.disconnect();
      observers.delete(rootMargin);
    }
  };
}

/** True while the element intersects the viewport grown by rootMargin. */
export function useInView(
  ref: RefObject<Element>,
  rootMargin = "150px 0px"
): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Very old browsers: no way to tell, so behave like a plain <img>.
      setVisible(true);
      return;
    }
    return observe(el, rootMargin, setVisible);
  }, [ref, rootMargin]);
  return visible;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** prefers-reduced-motion, updated live when the user changes it. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(REDUCED_MOTION);
    const update = () => setReduced(mql.matches);
    update();
    try {
      if (mql.addEventListener) {
        mql.addEventListener("change", update);
        return () => mql.removeEventListener("change", update);
      }
      // Safari < 14
      mql.addListener(update);
      return () => {
        try {
          mql.removeListener(update);
        } catch {
          // never throw from a cleanup
        }
      };
    } catch {
      return undefined;
    }
  }, []);
  return reduced;
}

interface NetworkInformationLike extends EventTarget {
  saveData?: boolean;
}

/** navigator.connection.saveData (Chromium only), updated on change. */
export function useSaveData(): boolean {
  const [saveData, setSaveData] = useState(false);
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const conn = (
      navigator as Navigator & { connection?: NetworkInformationLike }
    ).connection;
    if (!conn) return;
    const update = () => setSaveData(!!conn.saveData);
    update();
    try {
      conn.addEventListener?.("change", update);
    } catch {
      return undefined;
    }
    return () => {
      try {
        conn.removeEventListener?.("change", update);
      } catch {
        // never throw from a cleanup
      }
    };
  }, []);
  return saveData;
}

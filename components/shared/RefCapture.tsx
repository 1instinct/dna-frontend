import { useEffect } from "react";
import { useRouter } from "next/router";
import { v1 } from "@lib/api/v1";
import { readRef, refFromUrl, restoreRef, writeRef } from "@lib/affiliate/ref";

const CLICK_SEEN_KEY = "aff_ref_click";

const clickSeen = (key: string) => {
  try {
    if (window.sessionStorage.getItem(CLICK_SEEN_KEY) === key) return true;
    window.sessionStorage.setItem(CLICK_SEEN_KEY, key);
  } catch {
    // Session storage blocked: a reload may count a second click.
  }
  return false;
};

/**
 * Captures `?ref=CODE` on any page: stores it in the `aff_ref` cookie (the
 * newest code wins) and records the click. The click call is fire-and-forget;
 * its answer only adjusts the cookie: the affiliate's own cookie window, or
 * the previous code back if this one is unknown (204).
 */
export const RefCapture = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    try {
      const code = refFromUrl(window.location.href);
      if (!code) return;

      const previous = readRef();
      const path = window.location.pathname;
      // Last click wins: a new visit through a link restarts its window.
      writeRef(code, previous?.code === code ? previous.days : undefined);
      if (clickSeen(`${code}:${path}`)) return;

      let referrer = "";
      try {
        referrer = document.referrer ? new URL(document.referrer).host : "";
      } catch {
        referrer = "";
      }

      v1<{ ok?: boolean; cookie_days?: number } | undefined>(
        "/affiliate/clicks",
        {
          method: "POST",
          token: null,
          body: { code, landing_path: path, referrer },
          timeoutMs: 8000
        }
      )
        .then((res) => {
          if (res === undefined) {
            // Unknown or unapproved code: keep the one we had.
            if (previous?.code !== code) restoreRef(previous);
            return;
          }
          const days = Number(res?.cookie_days);
          if (days > 0) writeRef(code, days);
        })
        .catch(() => {
          // Offline or backend down: keep the code; the server checks it on attach.
        });
    } catch {
      // Never let referral capture break a page.
    }
  }, [router.isReady, router.asPath]);

  return null;
};

export default RefCapture;

// Browser bindings for the visit tracker and the chat session: the document's
// visibility, the page's URL and title, the stored UTM parameters and the
// cart's order token. Client only.

import { getStoredUtmParams } from "../../hooks/useUtmParams";
import type { ChatEnv } from "./session";
import type { VisitPayload } from "./types";
import type { VisitEnv } from "./visits";

const isVisible = () =>
  typeof document === "undefined" || document.visibilityState !== "hidden";

const onVisibilityChange = (fn: () => void) => {
  document.addEventListener("visibilitychange", fn);
  return () => document.removeEventListener("visibilitychange", fn);
};

/**
 * The guest cart's order token (config/storage keeps it in localStorage). A
 * signed-in user's cart is found from their Bearer token instead.
 */
export async function readOrderToken(): Promise<string | null> {
  try {
    const storage = (await import("../../config/storage")).default;
    return (
      (await storage.getGuestOrderToken()) ||
      (await storage.getOrderToken()) ||
      null
    );
  } catch {
    return null;
  }
}

/** First-touch UTM parameters (captured by _app), else the current URL's. */
export function currentUtm(): VisitPayload["utm"] | undefined {
  const stored = getStoredUtmParams();
  if (
    stored &&
    (stored.utm_source || stored.utm_medium || stored.utm_campaign)
  ) {
    return {
      source: stored.utm_source,
      medium: stored.utm_medium,
      campaign: stored.utm_campaign
    };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      source: params.get("utm_source") || undefined,
      medium: params.get("utm_medium") || undefined,
      campaign: params.get("utm_campaign") || undefined
    };
    return utm.source || utm.medium || utm.campaign ? utm : undefined;
  } catch {
    return undefined;
  }
}

export const browserVisitEnv = (): VisitEnv => ({
  href: () => window.location.href,
  title: () => document.title,
  initialReferrer: () => document.referrer || "",
  isVisible,
  onVisibilityChange,
  orderToken: readOrderToken,
  utm: currentUtm
});

export const browserChatEnv = (): ChatEnv => ({
  isVisible,
  onVisibilityChange
});

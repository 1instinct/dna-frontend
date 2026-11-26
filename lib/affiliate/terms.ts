/**
 * Program terms for public copy: the backend's Affiliates.config defaults
 * (10% commission, 30 day cookie, 30 day hold), each overridable with an env
 * var so a store that changes them on the backend can say so here. The
 * signed-in dashboard shows the affiliate's own rate and cookie window from
 * the API.
 */
import { DEFAULT_REF_DAYS } from "./ref";

const positive = (raw: string | undefined, fallback: number): number => {
  const n = Number((raw || "").trim());
  return raw && Number.isFinite(n) && n > 0 ? n : fallback;
};

export const DEFAULT_COMMISSION_BPS = positive(
  process.env.NEXT_PUBLIC_AFFILIATE_COMMISSION_BPS,
  1000
);
export const DEFAULT_COOKIE_DAYS = positive(
  process.env.NEXT_PUBLIC_AFFILIATE_COOKIE_DAYS,
  DEFAULT_REF_DAYS
);
export const HOLD_DAYS = positive(
  process.env.NEXT_PUBLIC_AFFILIATE_HOLD_DAYS,
  30
);

/** The store's name for program copy, or null when unset. */
export const SITE_TITLE: string | null =
  (process.env.NEXT_PUBLIC_SITE_TITLE || "").trim() || null;

/** Where affiliates write with questions, or null when unset. */
export const CONTACT_EMAIL: string | null =
  (process.env.NEXT_PUBLIC_COMPANY_EMAIL || "").trim() || null;

export const AFFILIATE_CHANNELS = [
  "YouTube",
  "TikTok",
  "Instagram",
  "Twitch",
  "X / Twitter",
  "Blog or website",
  "Newsletter",
  "Podcast",
  "Discord or community",
  "Teaching",
  "Other"
] as const;

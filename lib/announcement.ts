// Picks the admin-authored announcement bar and app-link override out of the
// homepage sections payload.
//
// Pure: no I/O, no window access. Both selectors take `unknown` on purpose:
// the payload crosses a network boundary from a JSON column with no schema,
// and `settings` sometimes arrives as an unparsed Ruby-hash string. A string
// `settings` is treated as unusable rather than parsed. `null` means "show
// nothing" / "use the env fallbacks"; neither function ever throws.

import { validUrl } from "./appLinks";
import type { AppLinkOverride } from "./appLinks";

export interface Announcement {
  id: number;
  message: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  dismissible: boolean;
  updatedAt: string;
}

type Settings = Record<string, unknown>;
type Candidate = { row: Record<string, unknown>; settings: Settings };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const orNull = (value: unknown): string | null => text(value) || null;

/**
 * Visible rows of one section type with usable (object) settings, lowest
 * position first. Rows without a numeric position sort last.
 */
const candidates = (sections: unknown, type: string): Candidate[] => {
  if (!Array.isArray(sections)) return [];
  const found: Candidate[] = [];
  for (const row of sections) {
    if (!isRecord(row)) continue;
    if (row.section_type !== type || row.is_visible === false) continue;
    if (!isRecord(row.settings)) continue;
    found.push({ row, settings: row.settings });
  }
  const pos = (c: Candidate) =>
    typeof c.row.position === "number" && !Number.isNaN(c.row.position)
      ? c.row.position
      : Number.POSITIVE_INFINITY;
  return found
    .map((c, i) => ({ c, i }))
    .sort((a, b) => pos(a.c) - pos(b.c) || a.i - b.i)
    .map(({ c }) => c);
};

/** Parsed time of an optional bound, or null if absent or unparseable. */
const bound = (value: unknown): number | null => {
  if (typeof value !== "string" || !value.trim()) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
};

const inWindow = (settings: Settings, now: number): boolean => {
  const start = bound(settings.starts_at);
  const end = bound(settings.ends_at);
  return (start === null || now >= start) && (end === null || now < end);
};

/**
 * The announcement bar to show now, or null. Takes the lowest-position visible
 * row that has a message and is inside its optional start/end window; a bar
 * outside its window does not shadow a later one.
 */
export const selectAnnouncement = (
  sections: unknown,
  now: Date = new Date()
): Announcement | null => {
  const time = now.getTime();
  for (const { row, settings } of candidates(sections, "announcement_bar")) {
    const message = text(settings.message);
    if (!message || !inWindow(settings, time)) continue;
    return {
      id: typeof row.id === "number" ? row.id : 0,
      message,
      ctaLabel: orNull(settings.cta_label),
      // Admin-authored: only an absolute http(s) URL may reach an anchor.
      ctaHref: validUrl(text(settings.cta_href)),
      dismissible: settings.dismissible !== false,
      updatedAt: typeof row.updated_at === "string" ? row.updated_at : ""
    };
  }
  return null;
};

/**
 * Store-link overrides from the lowest-position visible `app_links` row, with
 * missing values as "". Null when there is no usable row. Values are not
 * validated here; resolveAppLinks does that.
 */
export const selectAppLinkOverride = (
  sections: unknown
): AppLinkOverride | null => {
  const first = candidates(sections, "app_links")[0];
  if (!first) return null;
  return {
    ios_url: text(first.settings.ios_url),
    android_url: text(first.settings.android_url)
  };
};

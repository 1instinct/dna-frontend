// Storefront chat and visitor tracking flags, read from build-time env vars.
//
// NEXT_PUBLIC_* values are inlined by Next.js, so each one is read through a
// literal `process.env.NEXT_PUBLIC_...` expression (a computed key would not be
// replaced). Functions, not constants, so tests can change process.env.

const isOn = (value: string | undefined) =>
  ["true", "1", "on", "yes"].includes((value || "").trim().toLowerCase());
const isOff = (value: string | undefined) =>
  ["false", "0", "off", "no"].includes((value || "").trim().toLowerCase());

/** NEXT_PUBLIC_CHAT_ENABLED: the chat widget. Off unless set to true. */
export function chatEnabled(): boolean {
  return isOn(process.env.NEXT_PUBLIC_CHAT_ENABLED);
}

/**
 * NEXT_PUBLIC_VISITOR_TRACKING: visit pings for the admin's live visitors.
 * Unset follows the chat flag (on with chat, off without it); true or false
 * overrides it either way.
 */
export function visitorTrackingEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_VISITOR_TRACKING;
  if (isOn(raw)) return true;
  if (isOff(raw)) return false;
  return chatEnabled();
}

/**
 * The dna-admin host the storefront reads, without a trailing slash: the same
 * NEXT_PUBLIC_SPREE_API_URL the Spree SDK client and the other /api/v1 hooks use.
 */
export function apiBase(): string {
  return (process.env.NEXT_PUBLIC_SPREE_API_URL || "").replace(/\/+$/, "");
}

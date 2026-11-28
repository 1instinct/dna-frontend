// Consent gate for the chat widget and visitor tracking.
//
// The boilerplate has no cookie or consent banner, so consent starts as
// "granted" and the only thing stored is the visitor token in localStorage
// (no cookies). A fork that adds a banner calls `requireConsent()` before the
// app renders (e.g. at the top of pages/_app.tsx), then `grantConsent()` or
// `denyConsent()` from the banner. Nothing is stored, pinged or polled until
// consent is granted, and a refusal unmounts both features.

export type ConsentState = "granted" | "pending" | "denied";

type Listener = (state: ConsentState) => void;

let state: ConsentState = "granted";
const listeners = new Set<Listener>();

const set = (next: ConsentState) => {
  if (next === state) return;
  state = next;
  listeners.forEach((fn) => fn(state));
};

export const getConsent = (): ConsentState => state;

/** Waits for the banner: chat and tracking stay off until `grantConsent()`. */
export const requireConsent = () => set("pending");
export const grantConsent = () => set("granted");
export const denyConsent = () => set("denied");

export function subscribeConsent(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

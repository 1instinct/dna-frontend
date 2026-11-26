// Remembers that a visitor came from the native app. An app that opens site
// pages in the system browser adds `?from=app`; the site keeps that for the
// browser session (sessionStorage `from_app`), so callouts asking the visitor
// to get the app stay hidden on every later page.
//
// Pure apart from the default use of `window.sessionStorage`; a blocked or
// missing storage just means "not from the app".

export const FROM_APP_KEY = "from_app";

export type FlagStorage = Pick<Storage, "getItem" | "setItem">;

const sessionStore = (): FlagStorage | null => {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    // Reading window.sessionStorage itself throws when storage is blocked.
    return null;
  }
};

/** True when a URL or path carries `from=app`. */
export function fromAppInUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "https://placeholder.invalid");
    return parsed.searchParams.get("from") === "app";
  } catch {
    return false;
  }
}

/**
 * Stores the flag when the URL carries `from=app`. Returns whether it stored
 * it. Never throws; a URL without the parameter leaves the flag as it was.
 */
export function captureFromApp(
  url: string,
  storage: FlagStorage | null = sessionStore()
): boolean {
  if (!storage || !fromAppInUrl(url)) return false;
  try {
    storage.setItem(FROM_APP_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

/** Whether this browser session arrived from the app. */
export function isFromApp(
  storage: FlagStorage | null = sessionStore()
): boolean {
  try {
    return storage?.getItem(FROM_APP_KEY) === "1";
  } catch {
    return false;
  }
}

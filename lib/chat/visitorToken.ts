// The visitor token: a random id kept in localStorage that identifies this
// browser to dna-admin's storefront chat and visit API (X-Visitor-Token).
//
// The browser makes one on first use, so chat works with tracking off; the
// server may answer with another (an existing contact's, e.g. after resuming a
// conversation from an email link) and that one replaces it.

export const VISITOR_TOKEN_KEY = "visitorToken";

export type TokenStorage = Pick<Storage, "getItem" | "setItem">;

const localStore = (): TokenStorage | null => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    // Reading window.localStorage throws when storage is blocked.
    return null;
  }
};

// Kept for the page's lifetime so a blocked storage still has one stable id.
let memoryToken: string | null = null;

/** A random, URL-safe id: a UUID where the browser has one. */
export function randomToken(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === "function") {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const isValid = (token: unknown): token is string =>
  typeof token === "string" && /^[A-Za-z0-9_-]{8,128}$/.test(token);

export function readVisitorToken(
  storage: TokenStorage | null = localStore()
): string | null {
  try {
    const stored = storage?.getItem(VISITOR_TOKEN_KEY);
    if (isValid(stored)) return stored;
  } catch {
    // Fall through to the in-memory token.
  }
  return memoryToken;
}

/** Stores a token (ignored unless it looks like one). */
export function writeVisitorToken(
  token: unknown,
  storage: TokenStorage | null = localStore()
): void {
  if (!isValid(token)) return;
  memoryToken = token;
  try {
    storage?.setItem(VISITOR_TOKEN_KEY, token);
  } catch {
    // Quota or blocked storage: the in-memory token lasts for this page.
  }
}

/** The stored token, or a new one stored now. */
export function ensureVisitorToken(
  storage: TokenStorage | null = localStore()
): string {
  const existing = readVisitorToken(storage);
  if (existing) return existing;
  const token = randomToken();
  writeVisitorToken(token, storage);
  return token;
}

/** Test helper: forget the in-memory token. */
export function resetVisitorTokenMemory(): void {
  memoryToken = null;
}

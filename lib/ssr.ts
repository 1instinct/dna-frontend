import type { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";

/**
 * Helpers for pages that server-render React Query data (the PDP and the
 * store reviews page). Every SSR fetch is best-effort: on failure or timeout
 * the query is left out and the browser fetches it as before.
 */

/** react-query-auth's default query key (config/auth.ts sets no `key`). */
export const AUTH_USER_QUERY_KEY = "auth-user";

/** Server fetches give up after this long; the browser then fetches instead. */
export const SSR_FETCH_TIMEOUT_MS = 2500;

export const withTimeout = async <T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number = SSR_FETCH_TIMEOUT_MS
): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * react-query-auth's AuthProvider renders "Loading..." instead of the page
 * until its "auth-user" query succeeds, so without this the server would
 * never render the page. Seed an anonymous user: the browser refetches it on
 * mount (the token lives in localStorage). `updatedAt: 1` makes it older
 * than any real fetch, so hydrating on client-side navigation never
 * overwrites a signed-in user.
 */
export const seedAnonymousUser = (queryClient: QueryClient) =>
  queryClient.setQueryData(AUTH_USER_QUERY_KEY, null, { updatedAt: 1 });

/** Dehydrates through JSON so `undefined` values can't break Next's prop serialization. */
export const dehydrateForProps = (queryClient: QueryClient): unknown => {
  try {
    return JSON.parse(JSON.stringify(dehydrate(queryClient)));
  } catch {
    return null;
  }
};

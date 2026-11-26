/**
 * Small fetch helper for the backend's custom JSON endpoints under /api/v1.
 *
 * Calls go to the same origin; next.config.js rewrites /api/v1/* to the Spree
 * backend. Every failure is an `ApiError` with the HTTP `status` (0 when no
 * response arrived) and the parsed `body`.
 *
 *   const data = await v1<Affiliate>("/affiliate");            // stored Bearer
 *   await v1("/affiliate/clicks", { method: "POST", body, token: null });
 */

export type Query = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface V1Options {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** Sent as JSON. */
  body?: unknown;
  /**
   * Bearer token. Leave undefined to use the signed-in user's stored token
   * (if any); pass null to send no Authorization header.
   */
  token?: string | null;
  /** Guest cart token, sent as X-Spree-Order-Token. */
  orderToken?: string | null;
  query?: Query;
  signal?: AbortSignal;
  /** Abort after this many ms (no timeout by default). */
  timeoutMs?: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message || `Request failed (${status || "network"})`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

/** `/api/v1/<path>?<query>`, skipping null and undefined query values. */
export function v1Url(path: string, query?: Query): string {
  const clean = path.replace(/^\/+/, "");
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const qs = params.toString();
  return `/api/v1/${clean}${qs ? `?${qs}` : ""}`;
}

/** The signed-in user's Bearer token, refreshed if expired; null if none. */
export async function getBearerToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const storage = (await import("../../config/storage")).default;
    const token = await storage.getToken();
    return token?.access_token || null;
  } catch {
    return null;
  }
}

const readBody = async (res: Response): Promise<unknown> => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function v1<T = unknown>(
  path: string,
  opts: V1Options = {}
): Promise<T> {
  const { method = "GET", body, query, signal, timeoutMs } = opts;
  const token = opts.token === undefined ? await getBearerToken() : opts.token;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.orderToken) headers["X-Spree-Order-Token"] = opts.orderToken;

  let timer: ReturnType<typeof setTimeout> | undefined;
  let requestSignal = signal;
  if (timeoutMs || signal) {
    const ctrl = new AbortController();
    if (signal) {
      if (signal.aborted) ctrl.abort();
      else signal.addEventListener("abort", () => ctrl.abort());
    }
    if (timeoutMs) timer = setTimeout(() => ctrl.abort(), timeoutMs);
    requestSignal = ctrl.signal;
  }

  let res: Response;
  try {
    res = await fetch(v1Url(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: requestSignal
    });
  } catch (e) {
    throw new ApiError(0, null, e instanceof Error ? e.message : undefined);
  } finally {
    if (timer) clearTimeout(timer);
  }

  if (res.status === 204) return undefined as T;
  const parsed = await readBody(res);
  if (!res.ok) throw new ApiError(res.status, parsed);
  return parsed as T;
}

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const fieldSentences = (fields: Record<string, unknown>) =>
  Object.entries(fields).map(
    ([field, msgs]) =>
      `${sentence(field.replace(/_/g, " "))} ${
        Array.isArray(msgs) ? msgs.join(", ") : String(msgs)
      }`
  );

/**
 * Per-field messages from a `v1` error (`{ fields: { code: ["is taken"] } }`),
 * first message per field. Empty when the body has none.
 */
export function apiFieldErrors(e: unknown): Record<string, string> {
  if (!isApiError(e)) return {};
  const fields = (e.body as { fields?: unknown } | null)?.fields;
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields as Record<string, unknown>)) {
    const first = Array.isArray(v) ? v[0] : v;
    if (first !== undefined && first !== null && first !== "") {
      out[k] = String(first);
    }
  }
  return out;
}

/**
 * A readable message from an error thrown by `v1`. Prefers per-field errors
 * (`{ fields }` or `{ errors: { field: [msg] } }`), then `{ error }`,
 * `{ errors: [msg] }` and `{ message }`.
 */
export function apiErrorMessage(
  e: unknown,
  fallback = "Something went wrong. Try again."
): string {
  if (!isApiError(e)) return fallback;
  if (e.status === 0) {
    return "Can't reach the server. Check your connection and try again.";
  }
  const body = e.body as
    | { error?: unknown; errors?: unknown; message?: unknown; fields?: unknown }
    | null
    | undefined;
  if (body && typeof body === "object") {
    if (
      body.fields &&
      typeof body.fields === "object" &&
      !Array.isArray(body.fields)
    ) {
      const parts = fieldSentences(body.fields as Record<string, unknown>);
      if (parts.length) return parts.join(". ");
    }
    if (typeof body.error === "string" && body.error) return body.error;
    if (Array.isArray(body.errors) && body.errors.length) {
      return body.errors.map(String).join(". ");
    }
    if (body.errors && typeof body.errors === "object") {
      const parts = fieldSentences(body.errors as Record<string, unknown>);
      if (parts.length) return parts.join(". ");
    }
    if (typeof body.message === "string" && body.message) return body.message;
  }
  return fallback;
}

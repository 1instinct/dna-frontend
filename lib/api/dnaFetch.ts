/**
 * Small typed fetch wrapper for dna-admin's custom `/api/v1/*` endpoints
 * (reviews, questions, profiles, favorites, ...). Spree storefront v2 calls
 * still go through `spreeClient` (config/spree.ts).
 *
 * - Builds `${NEXT_PUBLIC_SPREE_API_URL}/api/v1${path}` plus a query string
 *   (arrays become `key[]=a&key[]=b`).
 * - Always sends `X-Spree-Token`; adds `Authorization: Bearer` when a user
 *   token exists (`auth: "required"` throws a 401 `DnaApiError` without one)
 *   and `X-Review-Token` when given.
 * - Unwraps the `{ response_code, response_message, response_data }` envelope
 *   when present, otherwise returns the parsed JSON.
 * - Safe to import server-side: the localStorage token is only read in the
 *   browser. On the server pass `bearerToken` explicitly if needed.
 */

export type DnaAuthMode = "none" | "optional" | "required";

export type DnaQueryScalar = string | number | boolean;
export type DnaQueryValue =
  | DnaQueryScalar
  | ReadonlyArray<DnaQueryScalar>
  | null
  | undefined;
export type DnaQuery = Record<string, DnaQueryValue>;

export type DnaHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface DnaFetchOptions {
  method?: DnaHttpMethod;
  query?: DnaQuery;
  /** JSON body. Ignored when `formData` is set. */
  body?: unknown;
  /** Multipart body (e.g. review photos). Content-Type is left to the browser. */
  formData?: FormData;
  /** Defaults to `"optional"`: send the Bearer token when one exists. */
  auth?: DnaAuthMode;
  /** Explicit Bearer token; skips the localStorage lookup (useful in SSR). */
  bearerToken?: string;
  /** Review request token from the email link, sent as `X-Review-Token`. */
  reviewToken?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export type DnaFieldErrors = Record<string, string[]>;

export class DnaApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: DnaFieldErrors;
  readonly body?: unknown;

  constructor(
    status: number,
    message: string,
    fieldErrors?: DnaFieldErrors,
    body?: unknown
  ) {
    super(message);
    this.name = "DnaApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.body = body;
    // Keep `instanceof` working when compiled to ES5.
    Object.setPrototypeOf(this, DnaApiError.prototype);
  }
}

export const isDnaApiError = (error: unknown): error is DnaApiError =>
  error instanceof DnaApiError;

interface DnaEnvelope<T> {
  response_code: number | string;
  response_message?: string;
  response_data?: T;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isEnvelope = (value: unknown): value is DnaEnvelope<unknown> =>
  isRecord(value) && "response_code" in value;

export const buildQueryString = (query?: DnaQuery): string => {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.keys(query).forEach((key) => {
    const value = query[key];
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      const arrayKey = key.endsWith("[]") ? key : `${key}[]`;
      value.forEach((item) => params.append(arrayKey, String(item)));
    } else {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const dnaApiUrl = (path: string, query?: DnaQuery): string => {
  const base = (process.env.NEXT_PUBLIC_SPREE_API_URL || "").replace(
    /\/+$/,
    ""
  );
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api/v1${normalizedPath}${buildQueryString(query)}`;
};

const readStoredBearerToken = async (): Promise<string | undefined> => {
  if (typeof window === "undefined") return undefined;
  try {
    const storage = (await import("../../config/storage")).default;
    const token = await storage.getToken();
    return token?.access_token || undefined;
  } catch {
    return undefined;
  }
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (value === undefined || value === null) return [];
  return [String(value)];
};

/**
 * Field errors come back as `errors` (Spree/Rails `errors.to_hash`) or as
 * `fields` (Profiles::ApiResponses). Values are normalized to string arrays.
 */
const extractFieldErrors = (body: unknown): DnaFieldErrors | undefined => {
  if (!isRecord(body)) return undefined;
  const source = isRecord(body.errors)
    ? body.errors
    : isRecord(body.fields)
    ? body.fields
    : undefined;
  if (!source) return undefined;
  const result: DnaFieldErrors = {};
  Object.keys(source).forEach((key) => {
    const messages = toStringArray(source[key]);
    if (messages.length) result[key] = messages;
  });
  return Object.keys(result).length ? result : undefined;
};

const extractMessage = (body: unknown, fallback: string): string => {
  if (typeof body === "string" && body.trim()) return body;
  if (!isRecord(body)) return fallback;
  const candidates = [body.response_message, body.message, body.error];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  if (Array.isArray(body.errors) && body.errors.length) {
    return body.errors.map((item) => String(item)).join(", ");
  }
  if (typeof body.errors === "string" && body.errors.trim()) {
    return body.errors;
  }
  return fallback;
};

const parseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function dnaFetch<T>(
  path: string,
  options: DnaFetchOptions = {}
): Promise<T> {
  const {
    method = "GET",
    query,
    body,
    formData,
    auth = "optional",
    bearerToken,
    reviewToken,
    headers: extraHeaders,
    signal
  } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Spree-Token": process.env.NEXT_PUBLIC_SPREE_ACCESS_TOKEN || ""
  };

  if (auth !== "none") {
    const token = bearerToken || (await readStoredBearerToken());
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (auth === "required") {
      throw new DnaApiError(401, "Please sign in to continue.");
    }
  }

  if (reviewToken) headers["X-Review-Token"] = reviewToken;

  let requestBody: BodyInit | undefined;
  if (formData) {
    // Let the browser set the multipart boundary.
    requestBody = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(dnaApiUrl(path, query), {
      method,
      headers: { ...headers, ...extraHeaders },
      body: requestBody,
      signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new DnaApiError(
      0,
      "We couldn't reach the server. Check your connection and try again."
    );
  }

  const parsed = await parseBody(response);

  if (!response.ok) {
    throw new DnaApiError(
      response.status,
      extractMessage(parsed, response.statusText || "Request failed"),
      extractFieldErrors(parsed),
      parsed
    );
  }

  if (isEnvelope(parsed)) {
    // Some legacy endpoints answer HTTP 200 with an error code in the envelope.
    const code = Number(parsed.response_code);
    if (Number.isFinite(code) && code >= 400) {
      throw new DnaApiError(
        code,
        extractMessage(parsed, "Request failed"),
        extractFieldErrors(parsed),
        parsed
      );
    }
    return parsed.response_data as T;
  }

  return parsed as T;
}

export default dnaFetch;

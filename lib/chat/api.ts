// Client for dna-admin's public storefront chat and visit API.
//
// Requests go to NEXT_PUBLIC_SPREE_API_URL + /api/v1/storefront (the backend's
// CORS follows its storefront API), with the visitor token in X-Visitor-Token
// and, when someone is signed in, their Spree Bearer token so the backend links
// the contact to the user. Failures are `ApiError`s from lib/api/v1; a 429 is
// a `RateLimitError` carrying how long to wait.

import { ApiError, getBearerToken } from "../api/v1";
import { apiBase } from "./config";
import type {
  ChatConversation,
  ChatInfo,
  ChatMessage,
  SendMessagePayload,
  VisitPayload,
  VisitResult
} from "./types";

/** Message body limits enforced by the backend. */
export const MESSAGE_MAX_LENGTH = 4000;

/** Used when a 429 has no Retry-After. */
export const DEFAULT_RETRY_AFTER_MS = 30_000;

export class RateLimitError extends ApiError {
  readonly retryAfterMs: number;

  constructor(body: unknown, retryAfterMs: number) {
    super(429, body, "Too many requests");
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

export const isRateLimitError = (e: unknown): e is RateLimitError =>
  e instanceof RateLimitError;

/** Retry-After in ms: delta seconds or an HTTP date; default when absent. */
export function parseRetryAfter(
  header: string | null,
  now = Date.now()
): number {
  if (!header) return DEFAULT_RETRY_AFTER_MS;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, 10 * 60_000);
  }
  const at = Date.parse(header);
  if (!Number.isNaN(at)) return Math.max(0, Math.min(at - now, 10 * 60_000));
  return DEFAULT_RETRY_AFTER_MS;
}

export interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  query?: Record<string, string | undefined>;
  visitorToken: string;
  signal?: AbortSignal;
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

export function storefrontUrl(
  path: string,
  query?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== "") params.set(key, value);
  }
  const qs = params.toString();
  return `${apiBase()}/api/v1/storefront/${path.replace(/^\/+/, "")}${
    qs ? `?${qs}` : ""
  }`;
}

export async function storefrontRequest<T>(
  path: string,
  opts: RequestOptions
): Promise<T> {
  const { method = "GET", body, query, visitorToken, signal } = opts;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Visitor-Token": visitorToken
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const bearer = await getBearerToken();
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  let res: Response;
  try {
    res = await fetch(storefrontUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal
    });
  } catch (e) {
    throw new ApiError(0, null, e instanceof Error ? e.message : undefined);
  }

  if (res.status === 204) return undefined as T;
  const parsed = await readBody(res);
  if (res.status === 429) {
    throw new RateLimitError(
      parsed,
      parseRetryAfter(res.headers.get("Retry-After"))
    );
  }
  if (!res.ok) throw new ApiError(res.status, parsed);
  return parsed as T;
}

// The backend renders plain JSON; these accept a `data` envelope as well, so a
// serializer change on either side does not break the widget.

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj =>
  !!v && typeof v === "object" && !Array.isArray(v);
const unwrap = (v: unknown): unknown =>
  isObj(v) && "data" in v && v.data !== undefined ? v.data : v;
const str = (v: unknown): string | null =>
  v === null || v === undefined || v === "" ? null : String(v);

export function normalizeMessage(raw: unknown): ChatMessage | null {
  const m = unwrap(isObj(raw) && isObj(raw.message) ? raw.message : raw);
  if (!isObj(m) || m.id === undefined || m.id === null) return null;
  const direction = m.direction === "outbound" ? "outbound" : "inbound";
  // Staff notes never reach the storefront; drop one if it does.
  if (m.direction === "note") return null;
  const author = isObj(m.author)
    ? { kind: str(m.author.kind) || undefined, name: str(m.author.name) }
    : null;
  return {
    id: String(m.id),
    direction,
    body: typeof m.body === "string" ? m.body : "",
    author,
    attachments: Array.isArray(m.attachments)
      ? (m.attachments as ChatMessage["attachments"])
      : [],
    created_at: str(m.created_at) || new Date().toISOString(),
    read_at: str(m.read_at)
  };
}

export function normalizeMessages(raw: unknown): ChatMessage[] {
  const v = unwrap(raw);
  const list = Array.isArray(v)
    ? v
    : isObj(v) && Array.isArray(v.messages)
    ? v.messages
    : [];
  return list.map(normalizeMessage).filter((m): m is ChatMessage => m !== null);
}

const normalizeConversation = (raw: unknown): ChatConversation | null => {
  if (!isObj(raw) || raw.id === undefined || raw.id === null) return null;
  const customer = isObj(raw.customer)
    ? { name: str(raw.customer.name), email: str(raw.customer.email) }
    : null;
  return { id: String(raw.id), status: str(raw.status) || undefined, customer };
};

export function normalizeChatInfo(raw: unknown): ChatInfo {
  const v = unwrap(raw);
  const o = isObj(v) ? v : {};
  return {
    conversation: normalizeConversation(o.conversation),
    greeting: str(o.greeting),
    online: typeof o.online === "boolean" ? o.online : null,
    visitor_token: str(o.visitor_token)
  };
}

export function normalizeVisit(raw: unknown): VisitResult {
  const v = unwrap(raw);
  const o = isObj(v) ? v : {};
  return {
    visitor_token: str(o.visitor_token),
    session_id: str(o.session_id)
  };
}

/** The calls the tracker and the chat session make. */
export interface StorefrontApi {
  postVisit(token: string, payload: VisitPayload): Promise<VisitResult>;
  getChat(token: string): Promise<ChatInfo>;
  getMessages(token: string, after?: string): Promise<ChatMessage[]>;
  sendMessage(token: string, payload: SendMessagePayload): Promise<ChatMessage>;
  markRead(token: string): Promise<void>;
  resume(token: string, resumeToken: string): Promise<ChatInfo>;
}

export const storefrontApi: StorefrontApi = {
  async postVisit(visitorToken, payload) {
    return normalizeVisit(
      await storefrontRequest("visits", {
        method: "POST",
        body: payload,
        visitorToken
      })
    );
  },
  async getChat(visitorToken) {
    return normalizeChatInfo(await storefrontRequest("chat", { visitorToken }));
  },
  async getMessages(visitorToken, after) {
    return normalizeMessages(
      await storefrontRequest("chat/messages", {
        visitorToken,
        query: { after }
      })
    );
  },
  async sendMessage(visitorToken, payload) {
    const raw = await storefrontRequest("chat/messages", {
      method: "POST",
      body: payload,
      visitorToken
    });
    const message = normalizeMessage(raw);
    if (!message) throw new ApiError(500, raw, "Unexpected reply");
    return message;
  },
  async markRead(visitorToken) {
    await storefrontRequest("chat/read", { method: "POST", visitorToken });
  },
  async resume(visitorToken, resumeToken) {
    return normalizeChatInfo(
      await storefrontRequest("chat/resume", {
        visitorToken,
        query: { token: resumeToken }
      })
    );
  }
};

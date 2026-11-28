// The storefront chat's state and server traffic, framework free so it can be
// tested without a DOM. components/Chat/ChatWidget renders it through
// hooks/useChat.
//
// 1. Polling: GET chat/messages?after=<last id> every 5 s while the panel is
//    open and every 30 s while it is minimised; paused while the tab is hidden
//    and while a 429's Retry-After lasts. With no conversation yet it polls
//    GET chat instead, so a conversation staff start shows up.
// 1. Sending is optimistic: the message shows at once, is retried once on a
//    network or server error, waits out a 429, and otherwise is marked failed
//    with a Retry action. Sends go out one at a time, in order.
// 1. Unread: staff replies that arrive while minimised, plus unread ones found
//    on load. Opening the panel clears them and calls POST chat/read.

import { apiErrorMessage, isApiError } from "../api/v1";
import { isRateLimitError, MESSAGE_MAX_LENGTH, StorefrontApi } from "./api";
import type { ChatDirection, ChatInfo, ChatMessage } from "./types";

export const OPEN_POLL_MS = 5_000;
export const MINIMISED_POLL_MS = 30_000;
export const SEND_RETRY_MS = 2_000;
/** Automatic retries after a network or server error, before "failed". */
export const SEND_AUTO_RETRIES = 1;

export type EntryStatus = "sent" | "sending" | "queued" | "failed";

export interface ChatEntry {
  /** The server id, or a local id until the server has the message. */
  key: string;
  id: string | null;
  direction: ChatDirection;
  body: string;
  authorName: string | null;
  createdAt: string;
  readAt: string | null;
  status: EntryStatus;
  error: string | null;
}

export interface ChatState {
  /** The first load has finished (successfully or not). */
  ready: boolean;
  open: boolean;
  conversationId: string | null;
  greeting: string | null;
  online: boolean | null;
  entries: ChatEntry[];
  unread: number;
  /** A load or polling problem, shown inline. */
  error: string | null;
  /** A polite rate-limit notice, shown inline. */
  notice: string | null;
  /** Offer the optional name and email fields (no conversation yet). */
  askContact: boolean;
}

export interface SendInput {
  body: string;
  name?: string;
  email?: string;
}

export type SendResult =
  | { ok: true }
  | { ok: false; field: "body" | "email"; error: string };

export interface ChatEnv {
  isVisible(): boolean;
  onVisibilityChange(fn: () => void): () => void;
}

export interface ChatSessionOptions {
  api: StorefrontApi;
  env: ChatEnv;
  getToken(): string;
  setToken(token: string): void;
  now?: () => number;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OFFLINE_ERROR =
  "We can't reach chat right now. We'll keep trying in the background.";
const EXPIRED_LINK =
  "That chat link has expired or isn't valid. You can start a new conversation here.";

const toEntry = (m: ChatMessage): ChatEntry => ({
  key: m.id,
  id: m.id,
  direction: m.direction,
  body: m.body,
  authorName: m.author?.name || null,
  createdAt: m.created_at,
  readAt: m.read_at || null,
  status: "sent",
  error: null
});

const rateLimitNotice = (ms: number) => {
  const s = Math.max(1, Math.ceil(ms / 1000));
  return `You're sending messages quickly. We'll send yours in ${s} second${
    s === 1 ? "" : "s"
  }.`;
};

export class ChatSession {
  private readonly opts: Required<ChatSessionOptions>;
  private state: ChatState = {
    ready: false,
    open: false,
    conversationId: null,
    greeting: null,
    online: null,
    entries: [],
    unread: 0,
    error: null,
    notice: null,
    askContact: true
  };
  private listeners = new Set<() => void>();
  private timer: unknown = null;
  private running = false;
  private polling: Promise<void> | null = null;
  private pollBlockedUntil = 0;
  private lastId: string | null = null;
  private contactSent = false;
  private markingRead = false;
  private sendQueue: Promise<void> = Promise.resolve();
  private pending = new Map<string, SendInput>();
  private localSeq = 0;
  private unsubscribeVisibility: (() => void) | null = null;

  constructor(options: ChatSessionOptions) {
    this.opts = {
      now: () => Date.now(),
      setTimer: (fn, ms) => setTimeout(fn, ms),
      clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
      ...options
    };
  }

  // ---- store interface (useSyncExternalStore) ----

  getState = (): ChatState => this.state;

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  private update(patch: Partial<ChatState>) {
    const next = { ...this.state, ...patch };
    next.askContact = !next.conversationId && !this.contactSent;
    this.state = next;
    this.listeners.forEach((fn) => fn());
  }

  // ---- lifecycle ----

  /** Loads the conversation (or resumes one from an email link) and starts polling. */
  async start(resumeToken?: string | null): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.unsubscribeVisibility = this.opts.env.onVisibilityChange(() =>
      this.visibilityChanged()
    );
    if (resumeToken) await this.resume(resumeToken);
    else await this.load();
    this.schedule();
  }

  stop(): void {
    this.running = false;
    this.unsubscribeVisibility?.();
    this.unsubscribeVisibility = null;
    this.clearTimer();
  }

  setOpen(open: boolean): void {
    if (open === this.state.open) return;
    this.update(open ? { open, unread: 0 } : { open });
    if (open) {
      void this.pollNow();
    } else {
      this.schedule();
    }
  }

  // ---- loading and polling ----

  private applyInfo(info: ChatInfo) {
    const patch: Partial<ChatState> = {
      greeting: info.greeting ?? this.state.greeting,
      online: info.online ?? this.state.online
    };
    if (info.conversation) {
      patch.conversationId = info.conversation.id;
      if (info.conversation.customer?.email) this.contactSent = true;
    } else if (this.state.conversationId) {
      // Closed or gone: start over with the next message.
      patch.conversationId = null;
      this.lastId = null;
    }
    this.update(patch);
  }

  private async load(): Promise<void> {
    const token = this.opts.getToken();
    try {
      const info = await this.opts.api.getChat(token);
      this.applyInfo(info);
      if (info.conversation) {
        const messages = await this.opts.api.getMessages(token);
        this.merge(messages, true);
      }
      this.update({ ready: true, error: null });
    } catch (e) {
      this.handlePollError(e);
      this.update({ ready: true });
    }
  }

  /** Opens and resumes the conversation from an email link (`?chat=<token>`). */
  async resumeFrom(resumeToken: string): Promise<void> {
    if (!this.running) return this.start(resumeToken);
    this.clearTimer();
    await this.resume(resumeToken);
    this.schedule();
  }

  private async resume(resumeToken: string): Promise<void> {
    try {
      const info = await this.opts.api.resume(
        this.opts.getToken(),
        resumeToken
      );
      if (info.visitor_token && info.visitor_token !== this.opts.getToken()) {
        this.opts.setToken(info.visitor_token);
      }
      this.applyInfo(info);
      if (info.conversation) {
        const messages = await this.opts.api.getMessages(this.opts.getToken());
        this.merge(messages, true);
      }
      this.update({ ready: true, open: true, unread: 0, error: null });
      void this.markReadIfNeeded();
    } catch (e) {
      if (isRateLimitError(e) || (isApiError(e) && e.status === 0)) {
        this.handlePollError(e);
        this.update({ ready: true, open: true });
        return;
      }
      // Expired, tampered or someone else's link: open an empty chat instead.
      await this.load();
      this.update({ open: true, error: EXPIRED_LINK });
    }
  }

  /** Polls now unless a poll is already running; resolves when it is done. */
  pollNow(): Promise<void> {
    if (!this.polling) {
      this.clearTimer();
      this.polling = this.poll().finally(() => {
        this.polling = null;
        this.schedule();
      });
    }
    return this.polling;
  }

  private async poll(): Promise<void> {
    if (!this.running) return;
    if (this.opts.now() < this.pollBlockedUntil) return;
    const token = this.opts.getToken();
    try {
      if (!this.state.conversationId || this.state.open) {
        // Opening refreshes the greeting and online status too.
        const hadConversation = this.state.conversationId;
        const info = await this.opts.api.getChat(token);
        this.applyInfo(info);
        if (info.conversation && info.conversation.id !== hadConversation) {
          this.lastId = null;
        }
      }
      if (this.state.conversationId) {
        const messages = await this.opts.api.getMessages(
          token,
          this.lastId || undefined
        );
        this.merge(messages, false);
      }
      if (this.state.error || this.state.notice) {
        this.update({ error: null, notice: null });
      }
      await this.markReadIfNeeded();
    } catch (e) {
      this.handlePollError(e);
    }
  }

  private handlePollError(e: unknown) {
    if (isRateLimitError(e)) {
      this.pollBlockedUntil = this.opts.now() + e.retryAfterMs;
      this.update({
        notice: "Chat is busy right now. We'll check for replies again shortly."
      });
      return;
    }
    if (isApiError(e) && e.status === 404 && this.state.conversationId) {
      this.lastId = null;
      this.update({ conversationId: null });
      return;
    }
    this.update({ error: OFFLINE_ERROR });
  }

  private merge(messages: ChatMessage[], initial: boolean) {
    if (!messages.length) return;
    const entries = [...this.state.entries];
    const known = new Set(entries.map((e) => e.id).filter(Boolean));
    let unread = this.state.unread;
    for (const m of messages) {
      this.lastId = m.id;
      if (known.has(m.id)) continue;
      known.add(m.id);
      entries.push(toEntry(m));
      if (m.direction === "outbound" && !this.state.open) {
        if (initial ? !m.read_at : true) unread += 1;
      }
    }
    this.update({ entries, unread });
  }

  private async markReadIfNeeded() {
    if (!this.state.open || this.markingRead) return;
    const unreadReplies = this.state.entries.some(
      (e) => e.direction === "outbound" && !e.readAt
    );
    if (!unreadReplies) return;
    this.markingRead = true;
    try {
      await this.opts.api.markRead(this.opts.getToken());
      const at = new Date(this.opts.now()).toISOString();
      this.update({
        entries: this.state.entries.map((e) =>
          e.direction === "outbound" && !e.readAt ? { ...e, readAt: at } : e
        )
      });
    } catch {
      // The next poll tries again.
    } finally {
      this.markingRead = false;
    }
  }

  private schedule() {
    this.clearTimer();
    if (!this.running || this.polling || !this.opts.env.isVisible()) return;
    const cadence = this.state.open ? OPEN_POLL_MS : MINIMISED_POLL_MS;
    const wait = Math.max(cadence, this.pollBlockedUntil - this.opts.now());
    this.timer = this.opts.setTimer(() => {
      this.timer = null;
      void this.pollNow();
    }, wait);
  }

  private clearTimer() {
    if (this.timer !== null) this.opts.clearTimer(this.timer);
    this.timer = null;
  }

  private visibilityChanged() {
    if (!this.running) return;
    if (this.opts.env.isVisible()) void this.pollNow();
    else this.clearTimer();
  }

  // ---- sending ----

  /** Validates and sends; the message shows at once. */
  send(input: SendInput): SendResult {
    const body = input.body.trim();
    if (!body) {
      return { ok: false, field: "body", error: "Write a message first." };
    }
    if (body.length > MESSAGE_MAX_LENGTH) {
      return {
        ok: false,
        field: "body",
        error: `Messages can be up to ${MESSAGE_MAX_LENGTH} characters.`
      };
    }
    const payload: SendInput = { body };
    if (this.state.askContact) {
      const name = (input.name || "").trim();
      const email = (input.email || "").trim();
      if (email && !EMAIL_RE.test(email)) {
        return {
          ok: false,
          field: "email",
          error: "Enter a valid email address, or leave it empty."
        };
      }
      if (name) payload.name = name.slice(0, 100);
      if (email) payload.email = email;
    }

    this.localSeq += 1;
    const key = `local-${this.localSeq}`;
    this.pending.set(key, payload);
    this.update({
      entries: [
        ...this.state.entries,
        {
          key,
          id: null,
          direction: "inbound",
          body,
          authorName: payload.name || null,
          createdAt: new Date(this.opts.now()).toISOString(),
          readAt: null,
          status: "sending",
          error: null
        }
      ]
    });
    this.enqueue(key);
    return { ok: true };
  }

  /** Sends a failed message again. */
  retry(key: string): void {
    const entry = this.state.entries.find((e) => e.key === key);
    if (!entry || entry.status !== "failed" || !this.pending.has(key)) return;
    this.patchEntry(key, { status: "sending", error: null });
    this.enqueue(key);
  }

  /** Resolves when every queued send has finished. For tests. */
  idle(): Promise<void> {
    return this.sendQueue;
  }

  private enqueue(key: string) {
    this.sendQueue = this.sendQueue.then(() => this.deliver(key));
  }

  private patchEntry(key: string, patch: Partial<ChatEntry>) {
    this.update({
      entries: this.state.entries.map((e) =>
        e.key === key ? { ...e, ...patch } : e
      )
    });
  }

  private sleep(ms: number) {
    return new Promise<void>((resolve) => this.opts.setTimer(resolve, ms));
  }

  private async deliver(key: string): Promise<void> {
    const payload = this.pending.get(key);
    if (!payload) return;
    for (let attempt = 0; ; attempt++) {
      try {
        const message = await this.opts.api.sendMessage(
          this.opts.getToken(),
          payload
        );
        this.pending.delete(key);
        const alreadyPolled = this.state.entries.some(
          (e) => e.id === message.id
        );
        if (payload.name || payload.email) this.contactSent = true;
        this.update({
          notice: null,
          entries: alreadyPolled
            ? this.state.entries.filter((e) => e.key !== key)
            : this.state.entries.map((e) =>
                e.key === key ? toEntry(message) : e
              )
        });
        if (!this.state.conversationId) {
          // The first message made the conversation: learn its id.
          this.contactSent = true;
          try {
            this.applyInfo(await this.opts.api.getChat(this.opts.getToken()));
          } catch {
            this.update({});
          }
        }
        return;
      } catch (e) {
        if (isRateLimitError(e)) {
          this.patchEntry(key, { status: "queued" });
          this.update({ notice: rateLimitNotice(e.retryAfterMs) });
          await this.sleep(e.retryAfterMs);
          if (!this.running) return;
          this.patchEntry(key, { status: "sending" });
          attempt -= 1; // waiting out a 429 doesn't use up a retry
          continue;
        }
        const retryable = isApiError(e) && (e.status === 0 || e.status >= 500);
        if (retryable && attempt < SEND_AUTO_RETRIES) {
          await this.sleep(SEND_RETRY_MS * (attempt + 1));
          continue;
        }
        this.patchEntry(key, {
          status: "failed",
          error: apiErrorMessage(e, "Your message wasn't sent.")
        });
        return;
      }
    }
  }
}

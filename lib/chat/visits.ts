// Visit pings for the admin's live visitors: POST /api/v1/storefront/visits on
// the first page, after every route change, and every 60 s while the tab is
// visible. Framework free; components/Chat/VisitorTracking wires it to the
// Next router and the document.

import { isRateLimitError, StorefrontApi } from "./api";
import type { VisitPayload } from "./types";

export const HEARTBEAT_MS = 60_000;
/** Lets next/head set the new page's title before the ping reads it. */
export const ROUTE_SETTLE_MS = 300;

export interface VisitEnv {
  href(): string;
  title(): string;
  /** document.referrer, for the first page only. */
  initialReferrer(): string;
  isVisible(): boolean;
  /** Calls `fn` when visibility changes; returns an unsubscribe. */
  onVisibilityChange(fn: () => void): () => void;
  orderToken(): Promise<string | null | undefined>;
  utm(): VisitPayload["utm"] | undefined;
}

export interface VisitTrackerOptions {
  api: Pick<StorefrontApi, "postVisit">;
  env: VisitEnv;
  getToken(): string;
  setToken(token: string): void;
  now?: () => number;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
}

export class VisitTracker {
  private readonly opts: Required<VisitTrackerOptions>;
  private heartbeat: unknown = null;
  private settle: unknown = null;
  private lastPingAt = 0;
  private blockedUntil = 0;
  private currentUrl: string | null = null;
  private currentReferrer = "";
  private unsubscribe: (() => void) | null = null;
  private running = false;

  constructor(options: VisitTrackerOptions) {
    this.opts = {
      now: () => Date.now(),
      setTimer: (fn, ms) => setTimeout(fn, ms),
      clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
      ...options
    };
  }

  /** Sends the first page's ping and starts the heartbeat. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.unsubscribe = this.opts.env.onVisibilityChange(() =>
      this.visibilityChanged()
    );
    if (this.opts.env.isVisible()) void this.ping();
  }

  stop(): void {
    this.running = false;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.clear("heartbeat");
    this.clear("settle");
  }

  /** Call on routeChangeComplete: pings once the new page has settled. */
  routeChanged(): void {
    if (!this.running) return;
    this.clear("settle");
    this.settle = this.opts.setTimer(() => {
      this.settle = null;
      void this.ping();
    }, ROUTE_SETTLE_MS);
  }

  private clear(which: "heartbeat" | "settle") {
    const handle = this[which];
    if (handle !== null) this.opts.clearTimer(handle);
    this[which] = null;
  }

  private visibilityChanged() {
    if (!this.running) return;
    if (!this.opts.env.isVisible()) {
      this.clear("heartbeat");
      return;
    }
    // Back in view: ping if the last one is a heartbeat old, else resume the beat.
    const since = this.opts.now() - this.lastPingAt;
    if (since >= HEARTBEAT_MS) void this.ping();
    else this.scheduleHeartbeat(HEARTBEAT_MS - since);
  }

  private scheduleHeartbeat(ms = HEARTBEAT_MS) {
    this.clear("heartbeat");
    if (!this.running || !this.opts.env.isVisible()) return;
    this.heartbeat = this.opts.setTimer(() => {
      this.heartbeat = null;
      void this.ping();
    }, ms);
  }

  /** One ping now; never throws. Exposed for tests. */
  async ping(): Promise<void> {
    if (!this.running) return;
    const { env } = this.opts;
    const now = this.opts.now();
    this.lastPingAt = now;
    // Every ping restarts the 60 s beat, so a route change doesn't double up.
    this.scheduleHeartbeat();
    if (now < this.blockedUntil) return;

    // A page's referrer is the page before it (document.referrer for the first).
    const url = env.href();
    if (url !== this.currentUrl) {
      this.currentReferrer =
        this.currentUrl === null ? env.initialReferrer() : this.currentUrl;
      this.currentUrl = url;
    }
    const referrer = this.currentReferrer;

    try {
      const payload: VisitPayload = { url, title: env.title(), referrer };
      const utm = env.utm();
      if (utm && (utm.source || utm.medium || utm.campaign)) payload.utm = utm;
      const orderToken = await env.orderToken().catch(() => null);
      if (orderToken) payload.order_token = orderToken;

      const res = await this.opts.api.postVisit(this.opts.getToken(), payload);
      if (res.visitor_token && res.visitor_token !== this.opts.getToken()) {
        this.opts.setToken(res.visitor_token);
      }
    } catch (e) {
      // Tracking never surfaces errors; a 429 waits out its Retry-After.
      if (isRateLimitError(e)) this.blockedUntil = now + e.retryAfterMs;
    }
  }
}

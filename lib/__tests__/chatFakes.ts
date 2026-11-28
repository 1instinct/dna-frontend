// Shared fakes for the chat suites (not a suite itself): a manual clock with
// timers, a visibility switch and a scriptable storefront API.

import type { StorefrontApi } from "../chat/api";
import type { ChatInfo, ChatMessage, VisitPayload } from "../chat/types";

export class FakeClock {
  now = 1_700_000_000_000;
  private seq = 0;
  private timers = new Map<number, { at: number; fn: () => void }>();

  setTimer = (fn: () => void, ms: number): unknown => {
    this.seq += 1;
    this.timers.set(this.seq, { at: this.now + ms, fn });
    return this.seq;
  };

  clearTimer = (handle: unknown) => {
    this.timers.delete(handle as number);
  };

  /** Pending timer delays from now, soonest first. */
  pending(): number[] {
    return Array.from(this.timers.values())
      .map((t) => t.at - this.now)
      .sort((a, b) => a - b);
  }

  /** Moves time forward, firing due timers in order and letting promises settle. */
  async advance(ms: number): Promise<void> {
    const end = this.now + ms;
    for (;;) {
      const due = Array.from(this.timers.entries())
        .filter(([, t]) => t.at <= end)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      this.timers.delete(due[0]);
      this.now = due[1].at;
      due[1].fn();
      await flush();
    }
    this.now = end;
    await flush();
  }
}

export const flush = async (rounds = 10) => {
  for (let i = 0; i < rounds; i++) {
    await new Promise((resolve) => setImmediate(resolve));
  }
};

export class FakeVisibility {
  visible = true;
  private listeners = new Set<() => void>();
  isVisible = () => this.visible;
  onVisibilityChange = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  set(visible: boolean) {
    this.visible = visible;
    this.listeners.forEach((fn) => fn());
  }
}

export const message = (
  id: string,
  direction: "inbound" | "outbound",
  body = `message ${id}`,
  extra: Partial<ChatMessage> = {}
): ChatMessage => ({
  id,
  direction,
  body,
  author: direction === "outbound" ? { kind: "staff", name: "Sam" } : null,
  attachments: [],
  created_at: "2026-11-28T10:00:00Z",
  read_at: null,
  ...extra
});

export type ApiCall = { name: keyof StorefrontApi; args: unknown[] };

type Impl = {
  [K in keyof StorefrontApi]: StorefrontApi[K];
};

/** Records every call; each method's behaviour can be replaced per test. */
export function fakeApi(overrides: Partial<Impl> = {}) {
  const calls: ApiCall[] = [];
  const impl: Impl = {
    postVisit: async () => ({ visitor_token: null, session_id: "s1" }),
    getChat: async (): Promise<ChatInfo> => ({
      conversation: null,
      greeting: "Hello there",
      online: true
    }),
    getMessages: async () => [],
    sendMessage: async (_token, payload) =>
      message(`srv-${calls.length}`, "inbound", payload.body),
    markRead: async () => undefined,
    resume: async () => ({ conversation: null, greeting: null, online: null }),
    ...overrides
  };
  const api = {} as StorefrontApi & { impl: Impl };
  (Object.keys(impl) as (keyof Impl)[]).forEach((name) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api as any)[name] = (...args: unknown[]) => {
      calls.push({ name, args });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (impl[name] as any)(...args);
    };
  });
  api.impl = impl;
  return { api, calls, impl };
}

export const callsOf = (calls: ApiCall[], name: keyof StorefrontApi) =>
  calls.filter((c) => c.name === name);

export const visitPayloads = (calls: ApiCall[]) =>
  callsOf(calls, "postVisit").map((c) => c.args[1] as VisitPayload);

import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";

import { ApiError } from "../api/v1";
import {
  DEFAULT_RETRY_AFTER_MS,
  RateLimitError,
  normalizeChatInfo,
  normalizeMessages,
  parseRetryAfter,
  storefrontApi,
  storefrontUrl
} from "../chat/api";
import { chatEnabled, visitorTrackingEnabled } from "../chat/config";

type Call = { url: string; init: RequestInit };
const g = globalThis as unknown as { fetch: typeof fetch };
const realFetch = g.fetch;
const env = process.env as Record<string, string | undefined>;
const saved = {
  api: env.NEXT_PUBLIC_SPREE_API_URL,
  chat: env.NEXT_PUBLIC_CHAT_ENABLED,
  tracking: env.NEXT_PUBLIC_VISITOR_TRACKING
};

const stubFetch = (
  status: number,
  body: string | null,
  headers: Record<string, string> = {}
) => {
  const calls: Call[] = [];
  g.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(body, {
      status,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers
      }
    });
  }) as unknown as typeof fetch;
  return calls;
};

beforeEach(() => {
  env.NEXT_PUBLIC_SPREE_API_URL = "https://admin.example.com/";
});

afterEach(() => {
  g.fetch = realFetch;
  env.NEXT_PUBLIC_SPREE_API_URL = saved.api;
  env.NEXT_PUBLIC_CHAT_ENABLED = saved.chat;
  env.NEXT_PUBLIC_VISITOR_TRACKING = saved.tracking;
});

describe("flags", () => {
  test("chat is off unless NEXT_PUBLIC_CHAT_ENABLED is true", () => {
    delete env.NEXT_PUBLIC_CHAT_ENABLED;
    assert.equal(chatEnabled(), false);
    env.NEXT_PUBLIC_CHAT_ENABLED = "false";
    assert.equal(chatEnabled(), false);
    env.NEXT_PUBLIC_CHAT_ENABLED = "true";
    assert.equal(chatEnabled(), true);
  });

  test("tracking follows chat unless NEXT_PUBLIC_VISITOR_TRACKING is set", () => {
    delete env.NEXT_PUBLIC_VISITOR_TRACKING;
    env.NEXT_PUBLIC_CHAT_ENABLED = "true";
    assert.equal(visitorTrackingEnabled(), true);
    env.NEXT_PUBLIC_CHAT_ENABLED = "";
    assert.equal(visitorTrackingEnabled(), false);
    env.NEXT_PUBLIC_VISITOR_TRACKING = "true";
    assert.equal(visitorTrackingEnabled(), true, "on without chat");
    env.NEXT_PUBLIC_CHAT_ENABLED = "true";
    env.NEXT_PUBLIC_VISITOR_TRACKING = "false";
    assert.equal(visitorTrackingEnabled(), false, "off with chat");
  });
});

describe("storefront requests", () => {
  test("go to the Spree API host with the visitor token header", async () => {
    const calls = stubFetch(
      200,
      JSON.stringify({ visitor_token: "v-server-1", session_id: 42 })
    );
    const res = await storefrontApi.postVisit("visitor-aaaaaaaa", {
      url: "https://shop.example.com/",
      title: "Home",
      referrer: ""
    });
    assert.deepEqual(res, { visitor_token: "v-server-1", session_id: "42" });
    assert.equal(
      calls[0].url,
      "https://admin.example.com/api/v1/storefront/visits"
    );
    assert.equal(calls[0].init.method, "POST");
    const headers = calls[0].init.headers as Record<string, string>;
    assert.equal(headers["X-Visitor-Token"], "visitor-aaaaaaaa");
    assert.equal(headers["Content-Type"], "application/json");
    assert.equal(headers.Authorization, undefined, "no Bearer when signed out");
  });

  test("polls messages with after=<id>", async () => {
    const calls = stubFetch(
      200,
      JSON.stringify([
        { id: 5, direction: "outbound", body: "Hi", created_at: "x" }
      ])
    );
    const list = await storefrontApi.getMessages("visitor-aaaaaaaa", "4");
    assert.equal(
      calls[0].url,
      "https://admin.example.com/api/v1/storefront/chat/messages?after=4"
    );
    assert.equal(list[0].id, "5");
    assert.equal(
      storefrontUrl("chat/resume", { token: "a b" }).endsWith("?token=a+b"),
      true
    );
  });

  test("a 429 is a RateLimitError with the Retry-After", async () => {
    stubFetch(429, JSON.stringify({ error: "slow down" }), {
      "Retry-After": "12"
    });
    await assert.rejects(storefrontApi.getChat("visitor-aaaaaaaa"), (e) => {
      assert.ok(e instanceof RateLimitError);
      assert.equal(e.retryAfterMs, 12_000);
      return true;
    });
  });

  test("other failures are ApiErrors with the status", async () => {
    stubFetch(422, JSON.stringify({ error: "Body is too long" }));
    await assert.rejects(
      storefrontApi.sendMessage("visitor-aaaaaaaa", { body: "x" }),
      (e) => e instanceof ApiError && e.status === 422
    );
  });
});

describe("parseRetryAfter", () => {
  test("reads seconds or an HTTP date, with a default", () => {
    assert.equal(parseRetryAfter("3"), 3000);
    assert.equal(parseRetryAfter(null), DEFAULT_RETRY_AFTER_MS);
    const now = Date.parse("2026-11-28T10:00:00Z");
    assert.equal(parseRetryAfter("Sat, 28 Nov 2026 10:00:30 GMT", now), 30_000);
    assert.equal(parseRetryAfter("soon"), DEFAULT_RETRY_AFTER_MS);
  });
});

describe("normalizers", () => {
  test("accept plain or data-wrapped replies and drop staff notes", () => {
    const list = normalizeMessages({
      data: [
        { id: 1, direction: "inbound", body: "a", created_at: "t" },
        { id: 2, direction: "note", body: "internal", created_at: "t" },
        {
          id: 3,
          direction: "outbound",
          body: "b",
          created_at: "t",
          author: { name: "Sam" }
        }
      ]
    });
    assert.deepEqual(
      list.map((m) => [m.id, m.direction, m.author?.name ?? null]),
      [
        ["1", "inbound", null],
        ["3", "outbound", "Sam"]
      ]
    );
  });

  test("chat info defaults", () => {
    assert.deepEqual(normalizeChatInfo({ conversation: null }), {
      conversation: null,
      greeting: null,
      online: null,
      visitor_token: null
    });
    const info = normalizeChatInfo({
      conversation: { id: 9, status: "open" },
      greeting: "Hi",
      online: true
    });
    assert.equal(info.conversation?.id, "9");
    assert.equal(info.online, true);
  });
});

/**
 * Route tests for pages/api/internal/reviews/summarize.ts. The real Anthropic
 * SDK client runs against a stubbed global `fetch`, so these assert the wire
 * request (headers and JSON body) as well as the dna-admin calls.
 * Run with `yarn test:unit`.
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import type { NextApiRequest, NextApiResponse } from "next";

import { resetAnthropicClient } from "../../lib/ai/anthropic";
import { REVIEW_SUMMARY_SCHEMA } from "../../lib/ai/reviewSummary";
import handler from "../../pages/api/internal/reviews/summarize";

const ADMIN = "https://admin.test";
const ENV = {
  ANTHROPIC_API_KEY: "sk-test-key",
  DNA_ADMIN_SERVICE_TOKEN: "service-api-key",
  INTERNAL_CRON_SECRET: "cron-secret",
  NEXT_PUBLIC_SPREE_API_URL: ADMIN,
  NEXT_PUBLIC_SPREE_ACCESS_TOKEN: "public-storefront-key"
};

interface Recorded {
  url: string;
  method: string;
  headers: Headers;
  body: unknown;
}

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
const originalConsole = { error: console.error, info: console.info };
let calls: Recorded[] = [];
let logs: string[] = [];

const json = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });

const reviewsFor = (id: number, name: string) => ({
  product: { id, slug: `p-${id}`, name, description: "A wrap top." },
  ratings_count: 12,
  reviews_count: 3,
  histogram: { "1": 1, "2": 0, "3": 1, "4": 2, "5": 8 },
  attributes: [],
  reviews: [
    {
      id: id * 10 + 1,
      rating: 5,
      title: "Soft",
      body: "SECRET-REVIEW-TEXT soft."
    },
    { id: id * 10 + 2, rating: 4, title: "", body: "Runs small." },
    { id: id * 10 + 3, rating: 1, title: "Bad", body: "Seams split." }
  ]
});

const modelOutput = {
  headline: "Soft, but runs small",
  summary: "Reviewers like the soft fabric. Some say it runs small.",
  pros: [{ label: "Soft fabric", mentions: 2 }],
  cons: [{ label: "Runs small", mentions: 1 }],
  fit_consensus: "runs_small"
};

const anthropicMessage = (overrides: Record<string, unknown> = {}) => ({
  id: "msg_test",
  type: "message",
  role: "assistant",
  model: "claude-opus-5-5",
  content: [{ type: "text", text: JSON.stringify(modelOutput) }],
  stop_reason: "end_turn",
  stop_sequence: null,
  stop_details: null,
  usage: { input_tokens: 100, output_tokens: 50 },
  ...overrides
});

type Router = (r: Recorded) => Response;

const installFetch = (route: Router) => {
  globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request).url;
    const raw = init?.body;
    let body: unknown = raw;
    if (typeof raw === "string") {
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
    }
    const recorded: Recorded = {
      url,
      method: (init?.method || "GET").toUpperCase(),
      headers: new Headers(init?.headers as HeadersInit),
      body
    };
    calls.push(recorded);
    return route(recorded);
  }) as typeof fetch;
};

/** Default dna-admin + Anthropic behaviour for the end-to-end test. */
const defaultRouter: Router = (r) => {
  if (r.url.startsWith("https://api.anthropic.com/")) {
    const content = JSON.stringify(r.body);
    if (content.includes("Refused Product")) {
      return json(
        200,
        anthropicMessage({
          content: [],
          stop_reason: "refusal",
          stop_details: { type: "refusal", category: "bio", explanation: null }
        })
      );
    }
    return json(200, anthropicMessage());
  }
  if (r.url === `${ADMIN}/api/v1/admin/review_summaries/stale?limit=10`) {
    return json(200, {
      data: [1, 2, 3].map((id) => ({
        product_id: id,
        slug: `p-${id}`,
        name: `Product ${id}`,
        reviews_count: 3,
        summarized_count: 0,
        generated_at: null
      }))
    });
  }
  const m = /\/api\/v1\/admin\/products\/(\d+)\/reviews_for_summary$/.exec(
    r.url
  );
  if (m) {
    const id = Number(m[1]);
    if (id === 1) return json(200, reviewsFor(1, "Wrap Top"));
    if (id === 2) return json(200, reviewsFor(2, "Refused Product"));
    return json(404, { error: "Not found" });
  }
  if (
    /\/api\/v1\/admin\/review_summaries\/\d+$/.test(r.url) &&
    r.method === "PUT"
  ) {
    return json(200, { ai_summary: { ...(r.body as object) } });
  }
  return json(500, { error: `unexpected ${r.method} ${r.url}` });
};

interface MockRes {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
}

const call = async (
  method: string,
  authorization?: string
): Promise<MockRes> => {
  const out: MockRes = { statusCode: 0, body: undefined, headers: {} };
  const req = {
    method,
    headers: authorization ? { authorization } : {}
  } as unknown as NextApiRequest;
  const res = {
    status(code: number) {
      out.statusCode = code;
      return this;
    },
    json(body: unknown) {
      out.body = body;
      return this;
    },
    setHeader(name: string, value: string) {
      out.headers[name.toLowerCase()] = value;
      return this;
    }
  } as unknown as NextApiResponse;
  await handler(req, res);
  return out;
};

beforeEach(() => {
  Object.assign(process.env, ENV);
  calls = [];
  logs = [];
  console.error = (...args: unknown[]) => logs.push(args.join(" "));
  console.info = (...args: unknown[]) => logs.push(args.join(" "));
  resetAnthropicClient();
  installFetch(defaultRouter);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  Object.keys(ENV).forEach((k) => {
    if (k in originalEnv) process.env[k] = originalEnv[k];
    else delete process.env[k];
  });
  resetAnthropicClient();
});

describe("auth and config", () => {
  it("405 for anything but POST", async () => {
    const res = await call("GET", "Bearer cron-secret");
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.allow, "POST");
    assert.equal(calls.length, 0);
  });

  it("401 for a missing or wrong secret", async () => {
    assert.equal((await call("POST")).statusCode, 401);
    assert.equal((await call("POST", "Bearer nope")).statusCode, 401);
    assert.equal((await call("POST", "cron-secret")).statusCode, 401);
    assert.equal((await call("POST", "Bearer cron-secret-x")).statusCode, 401);
    assert.equal(calls.length, 0);
  });

  it("503 when INTERNAL_CRON_SECRET is unset", async () => {
    delete process.env.INTERNAL_CRON_SECRET;
    assert.equal((await call("POST", "Bearer cron-secret")).statusCode, 503);
  });

  it("503 when ANTHROPIC_API_KEY is unset", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    assert.equal((await call("POST", "Bearer cron-secret")).statusCode, 503);
    assert.equal(calls.length, 0);
  });

  it("503 when DNA_ADMIN_SERVICE_TOKEN is unset", async () => {
    delete process.env.DNA_ADMIN_SERVICE_TOKEN;
    assert.equal((await call("POST", "Bearer cron-secret")).statusCode, 503);
    assert.equal(calls.length, 0);
  });
});

describe("end to end (fetch and Anthropic mocked)", () => {
  it("summarizes stale products and PUTs the result", async () => {
    const res = await call("POST", "Bearer cron-secret");
    assert.equal(res.statusCode, 200);
    // 1 summarized, 2 refused by the model (failed), 3 is a 404 (skipped).
    assert.deepEqual(res.body, { processed: 1, failed: 1, skipped: 1 });

    // dna-admin calls: service key as X-Spree-Token, no Authorization.
    const adminCalls = calls.filter((c) => c.url.startsWith(ADMIN));
    assert.equal(adminCalls.length, 1 + 3 + 1);
    adminCalls.forEach((c) => {
      assert.equal(c.headers.get("x-spree-token"), "service-api-key", c.url);
      assert.equal(c.headers.get("authorization"), null, c.url);
    });

    // Anthropic request shape on the wire.
    const anthropicCalls = calls.filter((c) =>
      c.url.startsWith("https://api.anthropic.com/")
    );
    assert.equal(anthropicCalls.length, 2);
    const req = anthropicCalls.find((c) =>
      JSON.stringify(c.body).includes("Wrap Top")
    )!;
    assert.ok(req.url.startsWith("https://api.anthropic.com/v1/messages"));
    assert.equal(req.method, "POST");
    // SDK 1.x sends the key as a Bearer token; older versions used x-api-key.
    assert.ok(
      req.headers.get("authorization") === "Bearer sk-test-key" ||
        req.headers.get("x-api-key") === "sk-test-key",
      "API key sent"
    );
    assert.ok(
      (req.headers.get("anthropic-beta") || "")
        .split(",")
        .map((s) => s.trim())
        .includes("server-side-fallback-2026-07-01"),
      `anthropic-beta: ${req.headers.get("anthropic-beta")}`
    );
    const body = req.body as Record<string, any>;
    assert.equal(body.model, "claude-opus-5-5");
    assert.equal(body.fallbacks, "default");
    assert.equal(body.output_config.effort, "low");
    assert.equal(body.output_config.format.type, "json_schema");
    assert.deepEqual(body.output_config.format.schema, REVIEW_SUMMARY_SCHEMA);
    assert.ok(!("thinking" in body), "no thinking param");
    assert.ok(!("betas" in body), "betas travel as a header");
    assert.equal(typeof body.system, "string");
    assert.equal(body.messages.length, 1);
    assert.equal(body.messages[0].role, "user");
    assert.ok(body.messages[0].content.includes("<reviews"));

    // PUT body for product 1.
    const puts = adminCalls.filter((c) => c.method === "PUT");
    assert.equal(puts.length, 1);
    assert.equal(puts[0].url, `${ADMIN}/api/v1/admin/review_summaries/1`);
    assert.equal(puts[0].headers.get("content-type"), "application/json");
    assert.deepEqual(puts[0].body, {
      ...modelOutput,
      review_count: 3,
      model: "claude-opus-5-5"
    });

    // Logs: ids and reasons only, never review text or secrets.
    const logText = logs.join("\n");
    assert.ok(logText.includes("product 2 failed: refusal (bio)"), logText);
    [
      "SECRET-REVIEW-TEXT",
      "sk-test-key",
      "service-api-key",
      "cron-secret"
    ].forEach((s) => assert.ok(!logText.includes(s), `log leaks ${s}`));
  });

  it("stops the batch when dna-admin says the feature is off (PUT 503)", async () => {
    installFetch((r) => {
      if (r.method === "PUT") return json(503, { error: "not_enabled" });
      if (r.url.endsWith("/reviews_for_summary")) {
        const id = Number(/products\/(\d+)\//.exec(r.url)![1]);
        return json(200, reviewsFor(id, `Product ${id}`));
      }
      return defaultRouter(r);
    });
    const res = await call("POST", "Bearer cron-secret");
    assert.equal(res.statusCode, 200);
    const body = res.body as {
      processed: number;
      failed: number;
      skipped: number;
    };
    assert.equal(body.processed, 0);
    assert.equal(body.failed, 0);
    assert.equal(body.skipped, 3);
  });

  it("502 when the stale list can't be loaded", async () => {
    installFetch((r) =>
      r.url.includes("/stale")
        ? json(403, { error: "Forbidden" })
        : defaultRouter(r)
    );
    const res = await call("POST", "Bearer cron-secret");
    assert.equal(res.statusCode, 502);
    assert.ok(logs.join("\n").includes("dna-admin HTTP 403"));
  });

  it("returns zeros when nothing is stale", async () => {
    installFetch((r) =>
      r.url.includes("/stale") ? json(200, { data: [] }) : defaultRouter(r)
    );
    const res = await call("POST", "Bearer cron-secret");
    assert.deepEqual(res.body, { processed: 0, failed: 0, skipped: 0 });
    assert.equal(
      calls.filter((c) => c.url.startsWith("https://api.anthropic.com/"))
        .length,
      0
    );
  });
});

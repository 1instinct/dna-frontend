import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ApiError,
  apiErrorMessage,
  apiFieldErrors,
  v1,
  v1Url
} from "../api/v1";

type Call = { url: string; init: RequestInit };
const g = globalThis as unknown as { fetch: typeof fetch };
const realFetch = g.fetch;

const stubFetch = (status: number, body: string | null, calls: Call[] = []) => {
  g.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(body, {
      status,
      headers: body ? { "Content-Type": "application/json" } : {}
    });
  }) as unknown as typeof fetch;
  return calls;
};

afterEach(() => {
  g.fetch = realFetch;
});

describe("v1Url", () => {
  it("prefixes /api/v1 and serializes defined query values", () => {
    assert.equal(v1Url("affiliate"), "/api/v1/affiliate");
    assert.equal(
      v1Url("/affiliate/stats", { from: "2026-11-01", to: "2026-11-14" }),
      "/api/v1/affiliate/stats?from=2026-11-01&to=2026-11-14"
    );
    assert.equal(
      v1Url("/affiliate/commissions", { page: 2, x: undefined, y: null }),
      "/api/v1/affiliate/commissions?page=2"
    );
  });
});

describe("v1", () => {
  it("sends JSON with a Bearer token and returns the parsed body", async () => {
    const calls = stubFetch(200, JSON.stringify({ ok: true }));
    const out = await v1<{ ok: boolean }>("/affiliate", {
      method: "POST",
      body: { code: "nova" },
      token: "abc"
    });
    assert.deepEqual(out, { ok: true });
    const headers = calls[0].init.headers as Record<string, string>;
    assert.equal(calls[0].url, "/api/v1/affiliate");
    assert.equal(calls[0].init.method, "POST");
    assert.equal(calls[0].init.body, JSON.stringify({ code: "nova" }));
    assert.equal(headers.Authorization, "Bearer abc");
    assert.equal(headers["Content-Type"], "application/json");
  });

  it("sends the order token header and no Authorization when token is null", async () => {
    const calls = stubFetch(200, "{}");
    await v1("/orders/current/affiliate", {
      method: "PATCH",
      token: null,
      orderToken: "ord"
    });
    const headers = calls[0].init.headers as Record<string, string>;
    assert.equal(headers["X-Spree-Order-Token"], "ord");
    assert.equal(headers.Authorization, undefined);
  });

  it("returns undefined for 204", async () => {
    stubFetch(204, null);
    assert.equal(await v1("/affiliate/clicks", { token: null }), undefined);
  });

  it("throws ApiError with status and parsed body on failure", async () => {
    stubFetch(422, JSON.stringify({ error: "Code is taken" }));
    await assert.rejects(
      v1("/affiliate", { method: "POST", token: "t" }),
      (e: unknown) =>
        e instanceof ApiError &&
        e.status === 422 &&
        (e.body as { error: string }).error === "Code is taken"
    );
  });

  it("throws ApiError with status 0 when the network fails", async () => {
    g.fetch = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    await assert.rejects(
      v1("/affiliate", { token: null }),
      (e: unknown) => e instanceof ApiError && e.status === 0
    );
  });
});

describe("apiErrorMessage", () => {
  it("reads Rails-style error bodies", () => {
    assert.equal(
      apiErrorMessage(new ApiError(422, { error: "Code is taken" })),
      "Code is taken"
    );
    assert.equal(
      apiErrorMessage(
        new ApiError(422, {
          errors: { code: ["is taken"], website: ["is blank"] }
        })
      ),
      "Code is taken. Website is blank"
    );
    assert.equal(
      apiErrorMessage(
        new ApiError(422, { errors: ["Payout email is invalid"] })
      ),
      "Payout email is invalid"
    );
  });

  it("prefers field errors over the generic error", () => {
    assert.equal(
      apiErrorMessage(
        new ApiError(422, {
          error: "Affiliate account could not be saved",
          fields: { code: ["has already been taken"] }
        })
      ),
      "Code has already been taken"
    );
    assert.equal(
      apiErrorMessage(
        new ApiError(422, {
          error: "x",
          fields: { payout_email: ["is invalid"], code: ["is too short"] }
        })
      ),
      "Payout email is invalid. Code is too short"
    );
  });

  it("falls back for empty bodies and other errors", () => {
    assert.equal(
      apiErrorMessage(new ApiError(500, null), "Try again"),
      "Try again"
    );
    assert.equal(
      apiErrorMessage(new ApiError(0, null)),
      "Can't reach the server. Check your connection and try again."
    );
    assert.equal(apiErrorMessage("nope", "Fallback"), "Fallback");
  });
});

describe("apiFieldErrors", () => {
  it("maps fields to their first message", () => {
    assert.deepEqual(
      apiFieldErrors(
        new ApiError(422, {
          error: "x",
          fields: { code: ["has already been taken", "is bad"], base: "nope" }
        })
      ),
      { code: "has already been taken", base: "nope" }
    );
  });

  it("is empty without fields", () => {
    assert.deepEqual(apiFieldErrors(new ApiError(422, { error: "x" })), {});
    assert.deepEqual(apiFieldErrors(new Error("x")), {});
  });
});

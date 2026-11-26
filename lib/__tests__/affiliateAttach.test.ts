import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { attachRefToOrder } from "../affiliate/attach";
import { REF_COOKIE } from "../affiliate/ref";

type Call = { url: string; init: RequestInit };
const g = globalThis as unknown as Record<string, unknown>;
const realFetch = g.fetch;
let store: Record<string, string>;
let calls: Call[];

const respond = (status: number) => {
  g.fetch = async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(status === 204 ? null : "{}", { status });
  };
};

beforeEach(() => {
  store = {};
  calls = [];
  g.window = {
    localStorage: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      }
    },
    location: { protocol: "https:" }
  };
  g.document = {
    cookie: `${REF_COOKIE}=${encodeURIComponent(
      JSON.stringify({ code: "nova", ts: Date.now() - 1000, days: 30 })
    )}`
  };
});

afterEach(() => {
  delete g.window;
  delete g.document;
  g.fetch = realFetch;
});

describe("attachRefToOrder", () => {
  it("sends the code with both the Bearer and the cart's order token", async () => {
    respond(200);
    await attachRefToOrder({
      bearerToken: "bear",
      orderToken: "cart",
      orderNumber: "R1"
    });
    const headers = calls[0].init.headers as Record<string, string>;
    assert.equal(calls[0].url, "/api/v1/orders/current/affiliate");
    assert.equal(calls[0].init.method, "PATCH");
    assert.equal(calls[0].init.body, JSON.stringify({ code: "nova" }));
    assert.equal(headers.Authorization, "Bearer bear");
    assert.equal(headers["X-Spree-Order-Token"], "cart");
  });

  it("does not send the same code for the same order twice", async () => {
    respond(200);
    await attachRefToOrder({ orderToken: "cart", orderNumber: "R1" });
    await attachRefToOrder({ orderToken: "cart", orderNumber: "R1" });
    assert.equal(calls.length, 1);
  });

  it("stops asking after a 422 for that order", async () => {
    respond(422);
    await attachRefToOrder({ orderToken: "cart", orderNumber: "R1" });
    await attachRefToOrder({ orderToken: "cart", orderNumber: "R1" });
    assert.equal(calls.length, 1);
  });

  it("asks again after a 401 or a network failure", async () => {
    respond(401);
    await attachRefToOrder({ bearerToken: "old", orderNumber: "R1" });
    g.fetch = async () => {
      throw new TypeError("offline");
    };
    await attachRefToOrder({ bearerToken: "old", orderNumber: "R1" });
    respond(200);
    await attachRefToOrder({ bearerToken: "new", orderNumber: "R1" });
    assert.equal(calls.length, 2);
    assert.equal(
      (calls[1].init.headers as Record<string, string>).Authorization,
      "Bearer new"
    );
  });

  it("does nothing without a referral code", async () => {
    respond(200);
    (g.document as { cookie: string }).cookie = "";
    await attachRefToOrder({ orderToken: "cart", orderNumber: "R1" });
    assert.equal(calls.length, 0);
  });
});

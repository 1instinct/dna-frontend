import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { RateLimitError } from "../chat/api";
import { HEARTBEAT_MS, ROUTE_SETTLE_MS, VisitTracker } from "../chat/visits";
import {
  FakeClock,
  FakeVisibility,
  callsOf,
  fakeApi,
  flush,
  visitPayloads
} from "./chatFakes";

const setup = (overrides: Parameters<typeof fakeApi>[0] = {}) => {
  const clock = new FakeClock();
  const visibility = new FakeVisibility();
  const { api, calls, impl } = fakeApi(overrides);
  const page = { href: "https://shop.example.com/", title: "Home" };
  let token = "visitor-aaaaaaaa";
  let orderToken: string | null = "order-123";
  const tracker = new VisitTracker({
    api,
    env: {
      href: () => page.href,
      title: () => page.title,
      initialReferrer: () => "https://search.example.com/",
      isVisible: visibility.isVisible,
      onVisibilityChange: visibility.onVisibilityChange,
      orderToken: async () => orderToken,
      utm: () => ({ source: "newsletter", medium: "email" })
    },
    getToken: () => token,
    setToken: (t) => {
      token = t;
    },
    now: () => clock.now,
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer
  });
  return {
    clock,
    visibility,
    calls,
    impl,
    page,
    tracker,
    token: () => token,
    setOrderToken: (t: string | null) => {
      orderToken = t;
    }
  };
};

describe("VisitTracker", () => {
  test("pings on first load with the page, referrer, UTM and cart token", async () => {
    const t = setup();
    t.tracker.start();
    await flush();
    const [payload] = visitPayloads(t.calls);
    assert.deepEqual(payload, {
      url: "https://shop.example.com/",
      title: "Home",
      referrer: "https://search.example.com/",
      utm: { source: "newsletter", medium: "email" },
      order_token: "order-123"
    });
    assert.equal(callsOf(t.calls, "postVisit")[0].args[0], "visitor-aaaaaaaa");
  });

  test("leaves out order_token when there is no cart", async () => {
    const t = setup();
    t.setOrderToken(null);
    t.tracker.start();
    await flush();
    assert.equal("order_token" in visitPayloads(t.calls)[0], false);
  });

  test("stores the visitor token the server answers with", async () => {
    const t = setup({
      postVisit: async () => ({
        visitor_token: "server-token-1",
        session_id: "s1"
      })
    });
    t.tracker.start();
    await flush();
    assert.equal(t.token(), "server-token-1");
  });

  test("pings after a route change once the page settles, with the previous page as referrer", async () => {
    const t = setup();
    t.tracker.start();
    await flush();
    t.page.href = "https://shop.example.com/products/mug";
    t.page.title = "Mug";
    t.tracker.routeChanged();
    await t.clock.advance(ROUTE_SETTLE_MS - 1);
    assert.equal(visitPayloads(t.calls).length, 1);
    await t.clock.advance(1);
    const payloads = visitPayloads(t.calls);
    assert.equal(payloads.length, 2);
    assert.equal(payloads[1].url, "https://shop.example.com/products/mug");
    assert.equal(payloads[1].title, "Mug");
    assert.equal(payloads[1].referrer, "https://shop.example.com/");
  });

  test("coalesces rapid route changes into one ping", async () => {
    const t = setup();
    t.tracker.start();
    await flush();
    t.tracker.routeChanged();
    await t.clock.advance(100);
    t.tracker.routeChanged();
    await t.clock.advance(ROUTE_SETTLE_MS);
    assert.equal(visitPayloads(t.calls).length, 2);
  });

  test("sends a heartbeat every 60 s while visible", async () => {
    const t = setup();
    t.tracker.start();
    await flush();
    await t.clock.advance(HEARTBEAT_MS - 1);
    assert.equal(visitPayloads(t.calls).length, 1);
    await t.clock.advance(1);
    assert.equal(visitPayloads(t.calls).length, 2);
    await t.clock.advance(HEARTBEAT_MS * 2);
    assert.equal(visitPayloads(t.calls).length, 4);
    // Same page: the referrer stays the first page's.
    assert.equal(
      visitPayloads(t.calls)[3].referrer,
      "https://search.example.com/"
    );
  });

  test("stops the heartbeat while hidden and pings on return when one is due", async () => {
    const t = setup();
    t.tracker.start();
    await flush();
    t.visibility.set(false);
    await t.clock.advance(HEARTBEAT_MS * 5);
    assert.equal(visitPayloads(t.calls).length, 1);
    t.visibility.set(true);
    await flush();
    assert.equal(visitPayloads(t.calls).length, 2);
  });

  test("returning before a heartbeat is due waits for the rest of it", async () => {
    const t = setup();
    t.tracker.start();
    await flush();
    await t.clock.advance(20_000);
    t.visibility.set(false);
    await t.clock.advance(10_000);
    t.visibility.set(true);
    await flush();
    assert.equal(visitPayloads(t.calls).length, 1);
    await t.clock.advance(30_000);
    assert.equal(visitPayloads(t.calls).length, 2);
  });

  test("does not ping on load in a background tab", async () => {
    const t = setup();
    t.visibility.visible = false;
    t.tracker.start();
    await flush();
    assert.equal(visitPayloads(t.calls).length, 0);
  });

  test("waits out a 429 and never throws", async () => {
    let first = true;
    const t = setup({
      postVisit: async () => {
        if (first) {
          first = false;
          throw new RateLimitError(null, 150_000);
        }
        return { visitor_token: null, session_id: "s1" };
      }
    });
    t.tracker.start();
    await flush();
    await t.clock.advance(HEARTBEAT_MS * 2);
    // The two heartbeats inside the Retry-After were skipped.
    assert.equal(visitPayloads(t.calls).length, 1);
    await t.clock.advance(HEARTBEAT_MS);
    assert.equal(visitPayloads(t.calls).length, 2);
  });

  test("stop clears every timer", async () => {
    const t = setup();
    t.tracker.start();
    await flush();
    t.tracker.routeChanged();
    t.tracker.stop();
    assert.deepEqual(t.clock.pending(), []);
    await t.clock.advance(HEARTBEAT_MS * 3);
    assert.equal(visitPayloads(t.calls).length, 1);
  });
});

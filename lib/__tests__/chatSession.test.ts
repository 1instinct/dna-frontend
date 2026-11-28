import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { ApiError } from "../api/v1";
import { RateLimitError } from "../chat/api";
import {
  ChatSession,
  MINIMISED_POLL_MS,
  OPEN_POLL_MS,
  SEND_RETRY_MS
} from "../chat/session";
import type { SendMessagePayload } from "../chat/types";
import {
  FakeClock,
  FakeVisibility,
  callsOf,
  fakeApi,
  flush,
  message
} from "./chatFakes";

const conversation = { id: "c1", status: "open", customer: null };

const setup = (overrides: Parameters<typeof fakeApi>[0] = {}) => {
  const clock = new FakeClock();
  const visibility = new FakeVisibility();
  const { api, calls, impl } = fakeApi(overrides);
  let token = "visitor-aaaaaaaa";
  const session = new ChatSession({
    api,
    env: {
      isVisible: visibility.isVisible,
      onVisibilityChange: visibility.onVisibilityChange
    },
    getToken: () => token,
    setToken: (t) => {
      token = t;
    },
    now: () => clock.now,
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer
  });
  return { clock, visibility, calls, impl, session, token: () => token };
};

const withConversation = (messages = [message("1", "inbound")]) =>
  setup({
    getChat: async () => ({ conversation, greeting: "Hi", online: true }),
    getMessages: async (_t, after) => (after ? [] : messages)
  });

const sentPayloads = (calls: ReturnType<typeof setup>["calls"]) =>
  callsOf(calls, "sendMessage").map((c) => c.args[1] as SendMessagePayload);

describe("ChatSession loading", () => {
  test("shows the greeting and online status from GET chat", async () => {
    const t = setup();
    await t.session.start();
    const s = t.session.getState();
    assert.equal(s.ready, true);
    assert.equal(s.greeting, "Hello there");
    assert.equal(s.online, true);
    assert.equal(s.conversationId, null);
    assert.equal(s.askContact, true);
    assert.equal(callsOf(t.calls, "getMessages").length, 0);
  });

  test("loads an existing conversation's messages and counts unread replies", async () => {
    const t = withConversation([
      message("1", "inbound"),
      message("2", "outbound", "Read one", { read_at: "2026-11-28T10:01:00Z" }),
      message("3", "outbound", "Unread one")
    ]);
    await t.session.start();
    const s = t.session.getState();
    assert.equal(s.conversationId, "c1");
    assert.deepEqual(
      s.entries.map((e) => e.key),
      ["1", "2", "3"]
    );
    assert.equal(s.unread, 1);
    assert.equal(s.askContact, false);
  });

  test("a load failure is shown inline and polling carries on", async () => {
    const t = setup({
      getChat: async () => {
        throw new ApiError(0, null);
      }
    });
    await t.session.start();
    assert.match(t.session.getState().error || "", /can't reach chat/i);
    t.impl.getChat = async () => ({
      conversation: null,
      greeting: "Back",
      online: true
    });
    await t.clock.advance(MINIMISED_POLL_MS);
    assert.equal(t.session.getState().error, null);
    assert.equal(t.session.getState().greeting, "Back");
  });
});

describe("ChatSession polling", () => {
  test("polls every 30 s while minimised and every 5 s while open", async () => {
    const t = withConversation();
    await t.session.start();
    assert.deepEqual(t.clock.pending(), [MINIMISED_POLL_MS]);

    const before = callsOf(t.calls, "getMessages").length;
    await t.clock.advance(MINIMISED_POLL_MS);
    assert.equal(callsOf(t.calls, "getMessages").length, before + 1);
    assert.equal(
      callsOf(t.calls, "getMessages").at(-1)?.args[1],
      "1",
      "polls with after=<last id>"
    );

    t.session.setOpen(true);
    await flush();
    const opened = callsOf(t.calls, "getMessages").length;
    assert.equal(opened, before + 2, "opening polls at once");
    assert.deepEqual(t.clock.pending(), [OPEN_POLL_MS]);
    await t.clock.advance(OPEN_POLL_MS * 3);
    assert.equal(callsOf(t.calls, "getMessages").length, opened + 3);

    t.session.setOpen(false);
    assert.deepEqual(t.clock.pending(), [MINIMISED_POLL_MS]);
  });

  test("pauses while the tab is hidden and polls on return", async () => {
    const t = withConversation();
    await t.session.start();
    t.visibility.set(false);
    assert.deepEqual(t.clock.pending(), []);
    const before = callsOf(t.calls, "getMessages").length;
    await t.clock.advance(MINIMISED_POLL_MS * 4);
    assert.equal(callsOf(t.calls, "getMessages").length, before);
    t.visibility.set(true);
    await flush();
    assert.equal(callsOf(t.calls, "getMessages").length, before + 1);
    assert.deepEqual(t.clock.pending(), [MINIMISED_POLL_MS]);
  });

  test("a staff reply while minimised raises the unread count; opening clears it and marks read", async () => {
    const t = withConversation();
    await t.session.start();
    t.impl.getMessages = async () => [message("2", "outbound", "Hi, yes!")];
    await t.clock.advance(MINIMISED_POLL_MS);
    assert.equal(t.session.getState().unread, 1);
    t.impl.getMessages = async () => [];

    t.session.setOpen(true);
    await flush();
    assert.equal(t.session.getState().unread, 0);
    assert.equal(callsOf(t.calls, "markRead").length, 1);
    assert.ok(t.session.getState().entries.find((e) => e.key === "2")?.readAt);
  });

  test("with no conversation it polls GET chat, so a staff-started one appears", async () => {
    const t = setup();
    await t.session.start();
    t.impl.getChat = async () => ({
      conversation,
      greeting: "Hi",
      online: true
    });
    t.impl.getMessages = async () => [message("9", "outbound", "Need help?")];
    await t.clock.advance(MINIMISED_POLL_MS);
    const s = t.session.getState();
    assert.equal(s.conversationId, "c1");
    assert.equal(s.unread, 1);
  });

  test("a 429 pauses polling for its Retry-After with a polite notice", async () => {
    const t = withConversation();
    await t.session.start();
    t.impl.getMessages = async () => {
      throw new RateLimitError(null, 90_000);
    };
    await t.clock.advance(MINIMISED_POLL_MS);
    assert.match(t.session.getState().notice || "", /busy/i);
    assert.equal(t.session.getState().error, null);
    const after429 = callsOf(t.calls, "getMessages").length;
    t.impl.getMessages = async () => [];
    await t.clock.advance(89_000);
    assert.equal(callsOf(t.calls, "getMessages").length, after429);
    await t.clock.advance(1_000);
    assert.equal(callsOf(t.calls, "getMessages").length, after429 + 1);
    assert.equal(t.session.getState().notice, null);
  });

  test("stop ends polling", async () => {
    const t = withConversation();
    await t.session.start();
    t.session.stop();
    assert.deepEqual(t.clock.pending(), []);
  });
});

describe("ChatSession sending", () => {
  test("shows the message at once, then swaps in the server's copy", async () => {
    let release: () => void = () => undefined;
    const t = setup({
      sendMessage: (_t, p) =>
        new Promise((resolve) => {
          release = () => resolve(message("50", "inbound", p.body));
        })
    });
    await t.session.start();
    assert.deepEqual(t.session.send({ body: "  Is this in stock?  " }), {
      ok: true
    });
    let entry = t.session.getState().entries[0];
    assert.equal(entry.body, "Is this in stock?");
    assert.equal(entry.status, "sending");
    assert.equal(entry.id, null);

    t.impl.getChat = async () => ({
      conversation,
      greeting: "Hi",
      online: true
    });
    await flush();
    release();
    await t.session.idle();
    await flush();
    entry = t.session.getState().entries[0];
    assert.equal(entry.key, "50");
    assert.equal(entry.status, "sent");
    assert.equal(t.session.getState().conversationId, "c1");
  });

  test("retries once after a network or server error, then succeeds", async () => {
    let attempts = 0;
    const t = setup({
      sendMessage: async (_t, p) => {
        attempts += 1;
        if (attempts === 1) throw new ApiError(503, null);
        return message("51", "inbound", p.body);
      }
    });
    await t.session.start();
    t.session.send({ body: "Hello" });
    await flush();
    assert.equal(attempts, 1);
    assert.equal(t.session.getState().entries[0].status, "sending");
    await t.clock.advance(SEND_RETRY_MS);
    await t.session.idle();
    assert.equal(attempts, 2);
    assert.equal(t.session.getState().entries[0].status, "sent");
  });

  test("marks the message failed after the retry, and Retry sends it again", async () => {
    let fail = true;
    const t = setup({
      sendMessage: async (_t, p) => {
        if (fail) throw new ApiError(0, null);
        return message("52", "inbound", p.body);
      }
    });
    await t.session.start();
    t.session.send({ body: "Hello" });
    await flush();
    await t.clock.advance(SEND_RETRY_MS);
    await t.session.idle();
    const failed = t.session.getState().entries[0];
    assert.equal(failed.status, "failed");
    assert.match(failed.error || "", /check your connection/i);
    assert.equal(callsOf(t.calls, "sendMessage").length, 2);

    fail = false;
    t.session.retry(failed.key);
    assert.equal(t.session.getState().entries[0].status, "sending");
    await t.session.idle();
    assert.equal(t.session.getState().entries[0].status, "sent");
    assert.equal(callsOf(t.calls, "sendMessage").length, 3);
  });

  test("a validation error fails at once with the server's message", async () => {
    const t = setup({
      sendMessage: async () => {
        throw new ApiError(422, { error: "Body is too long" });
      }
    });
    await t.session.start();
    t.session.send({ body: "Hello" });
    await t.session.idle();
    const entry = t.session.getState().entries[0];
    assert.equal(entry.status, "failed");
    assert.equal(entry.error, "Body is too long");
    assert.equal(callsOf(t.calls, "sendMessage").length, 1);
  });

  test("a 429 queues the message, says so politely and sends it after Retry-After", async () => {
    let limited = true;
    const t = setup({
      sendMessage: async (_t, p) => {
        if (limited) throw new RateLimitError(null, 20_000);
        return message("53", "inbound", p.body);
      }
    });
    await t.session.start();
    t.session.send({ body: "Hello" });
    await flush();
    assert.equal(t.session.getState().entries[0].status, "queued");
    assert.match(t.session.getState().notice || "", /in 20 seconds/);
    limited = false;
    await t.clock.advance(20_000);
    await t.session.idle();
    assert.equal(t.session.getState().entries[0].status, "sent");
    assert.equal(t.session.getState().notice, null);
  });

  test("sends go out one at a time, in order", async () => {
    const order: string[] = [];
    const t = setup({
      sendMessage: async (_t, p) => {
        order.push(p.body);
        await flush(2);
        return message(`m-${p.body}`, "inbound", p.body);
      }
    });
    await t.session.start();
    t.session.send({ body: "one" });
    t.session.send({ body: "two" });
    t.session.send({ body: "three" });
    await t.session.idle();
    assert.deepEqual(order, ["one", "two", "three"]);
  });

  test("rejects an empty or over-long message without sending", async () => {
    const t = setup();
    await t.session.start();
    assert.deepEqual(t.session.send({ body: "   " }), {
      ok: false,
      field: "body",
      error: "Write a message first."
    });
    const long = t.session.send({ body: "x".repeat(4001) });
    assert.equal(long.ok, false);
    assert.equal(t.session.getState().entries.length, 0);
    assert.equal(callsOf(t.calls, "sendMessage").length, 0);
  });
});

describe("ChatSession first-message contact fields", () => {
  test("sends name and email with the first message only", async () => {
    const t = setup();
    await t.session.start();
    assert.equal(t.session.getState().askContact, true);
    t.impl.getChat = async () => ({
      conversation,
      greeting: "Hi",
      online: true
    });
    t.session.send({ body: "First", name: " Ada ", email: "ada@example.com" });
    await t.session.idle();
    await flush();
    assert.equal(t.session.getState().askContact, false);
    t.session.send({ body: "Second", name: "Ada", email: "ada@example.com" });
    await t.session.idle();
    assert.deepEqual(sentPayloads(t.calls), [
      { body: "First", name: "Ada", email: "ada@example.com" },
      { body: "Second" }
    ]);
  });

  test("the fields are optional", async () => {
    const t = setup();
    await t.session.start();
    t.session.send({ body: "Hi", name: "", email: "" });
    await t.session.idle();
    assert.deepEqual(sentPayloads(t.calls), [{ body: "Hi" }]);
  });

  test("an invalid email is refused inline", async () => {
    const t = setup();
    await t.session.start();
    assert.deepEqual(t.session.send({ body: "Hi", email: "not-an-email" }), {
      ok: false,
      field: "email",
      error: "Enter a valid email address, or leave it empty."
    });
    assert.equal(callsOf(t.calls, "sendMessage").length, 0);
  });

  test("not asked when the conversation already has the customer's email", async () => {
    const t = setup({
      getChat: async () => ({
        conversation: {
          id: "c1",
          customer: { name: "Ada", email: "ada@example.com" }
        },
        greeting: null,
        online: false
      })
    });
    await t.session.start();
    assert.equal(t.session.getState().askContact, false);
  });
});

describe("ChatSession resume from ?chat=<token>", () => {
  test("opens the panel on the linked conversation and adopts its visitor token", async () => {
    const t = setup({
      resume: async () => ({
        conversation,
        greeting: "Welcome back",
        online: false,
        visitor_token: "linked-visitor-1"
      }),
      getMessages: async () => [message("7", "outbound", "Your order shipped")]
    });
    await t.session.start("signed-token");
    const resumeCall = callsOf(t.calls, "resume")[0];
    assert.deepEqual(resumeCall.args, ["visitor-aaaaaaaa", "signed-token"]);
    assert.equal(t.token(), "linked-visitor-1");
    const s = t.session.getState();
    assert.equal(s.open, true);
    assert.equal(s.conversationId, "c1");
    assert.equal(s.entries[0].body, "Your order shipped");
    assert.equal(s.unread, 0);
    await flush();
    assert.equal(callsOf(t.calls, "markRead").length, 1);
    assert.deepEqual(t.clock.pending(), [OPEN_POLL_MS]);
  });

  test("an expired link opens an empty chat with an inline note", async () => {
    const t = setup({
      resume: async () => {
        throw new ApiError(410, { error: "expired" });
      }
    });
    await t.session.start("old-token");
    const s = t.session.getState();
    assert.equal(s.open, true);
    assert.match(s.error || "", /expired or isn't valid/);
    assert.equal(s.greeting, "Hello there");
  });
});

import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import React from "react";
import { renderToStaticMarkup as renderMarkup } from "react-dom/server";

import { ChatPanelBody } from "../../components/Chat/ChatPanelBody";
import { StorefrontChat } from "../../components/Chat/StorefrontChat";
import { denyConsent, grantConsent, requireConsent } from "../chat/consent";
import type { ChatEntry, ChatState } from "../chat/session";

// react-dom/server's types pull a second copy of @types/react (an existing
// duplicate in node_modules), so its element type doesn't match JSX's here.
const renderToStaticMarkup = renderMarkup as unknown as (
  element: React.ReactNode
) => string;

const env = process.env as Record<string, string | undefined>;
const saved = {
  chat: env.NEXT_PUBLIC_CHAT_ENABLED,
  tracking: env.NEXT_PUBLIC_VISITOR_TRACKING
};

afterEach(() => {
  env.NEXT_PUBLIC_CHAT_ENABLED = saved.chat;
  env.NEXT_PUBLIC_VISITOR_TRACKING = saved.tracking;
  grantConsent();
});

const Widget = () => <div data-stub="widget" />;
const Tracker = () => <div data-stub="tracker" />;
const render = (props = {}) =>
  renderToStaticMarkup(
    <StorefrontChat widget={Widget} tracker={Tracker} {...props} />
  );

describe("StorefrontChat", () => {
  test("renders nothing when the flags are off", () => {
    delete env.NEXT_PUBLIC_CHAT_ENABLED;
    delete env.NEXT_PUBLIC_VISITOR_TRACKING;
    assert.equal(render(), "");
    // The real (lazy) components too: nothing to load or show.
    assert.equal(renderToStaticMarkup(<StorefrontChat />), "");
  });

  test("mounts the widget and tracking when chat is on", () => {
    env.NEXT_PUBLIC_CHAT_ENABLED = "true";
    delete env.NEXT_PUBLIC_VISITOR_TRACKING;
    assert.equal(
      render(),
      '<div data-stub="tracker"></div><div data-stub="widget"></div>'
    );
  });

  test("tracking can run without the widget, and the widget without tracking", () => {
    delete env.NEXT_PUBLIC_CHAT_ENABLED;
    env.NEXT_PUBLIC_VISITOR_TRACKING = "true";
    assert.equal(render(), '<div data-stub="tracker"></div>');
    env.NEXT_PUBLIC_CHAT_ENABLED = "true";
    env.NEXT_PUBLIC_VISITOR_TRACKING = "false";
    assert.equal(render(), '<div data-stub="widget"></div>');
  });

  test("hideWidget keeps tracking only", () => {
    env.NEXT_PUBLIC_CHAT_ENABLED = "true";
    assert.equal(
      render({ hideWidget: true }),
      '<div data-stub="tracker"></div>'
    );
  });

  test("waits for consent when a banner requires it, and stays off when declined", () => {
    env.NEXT_PUBLIC_CHAT_ENABLED = "true";
    requireConsent();
    assert.equal(render(), "");
    denyConsent();
    assert.equal(render(), "");
    grantConsent();
    assert.notEqual(render(), "");
  });
});

const state = (patch: Partial<ChatState> = {}): ChatState => ({
  ready: true,
  open: true,
  conversationId: null,
  greeting: null,
  online: true,
  entries: [],
  unread: 0,
  error: null,
  notice: null,
  askContact: true,
  ...patch
});

const entry = (patch: Partial<ChatEntry>): ChatEntry => ({
  key: "1",
  id: "1",
  direction: "inbound",
  body: "Hello",
  authorName: null,
  createdAt: "2026-11-28T10:00:00Z",
  readAt: null,
  status: "sent",
  error: null,
  ...patch
});

const panel = (s: ChatState) =>
  renderToStaticMarkup(
    <ChatPanelBody
      state={s}
      onSend={() => ({ ok: true })}
      onRetry={() => undefined}
    />
  );

describe("ChatPanelBody", () => {
  test("offers optional, labelled name and email fields before the first message", () => {
    const html = panel(state());
    assert.match(html, /so we can reply by email/);
    assert.match(
      html,
      /<label for="chat-name"[^>]*>Name \(optional\)<\/label>/
    );
    assert.match(
      html,
      /<label for="chat-email"[^>]*>Email \(optional\)<\/label>/
    );
    assert.match(html, /id="chat-email"[^>]*type="email"/);
    assert.doesNotMatch(html, /required/);
  });

  test("hides them once there is a conversation", () => {
    const html = panel(state({ conversationId: "c1", askContact: false }));
    assert.doesNotMatch(html, /chat-email/);
    assert.match(html, /<label for="chat-message"[^>]*>Message<\/label>/);
  });

  test("shows the server's greeting, else a default", () => {
    assert.match(
      panel(state({ greeting: "Welcome to the shop" })),
      /Welcome to the shop/
    );
    assert.match(panel(state()), /Ask us anything/);
  });

  test("has a polite live region and labelled message list", () => {
    const html = panel(state());
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /<ol aria-label="Messages"/);
  });

  test("shows errors and rate-limit notices inline", () => {
    const html = panel(
      state({
        error: "We can't reach chat right now.",
        notice: "Chat is busy."
      })
    );
    assert.match(
      html,
      /role="alert"[^>]*>We can&#x27;t reach chat right now\./
    );
    assert.match(html, /role="status"[^>]*>Chat is busy\./);
  });

  test("marks pending and failed messages, with Retry on a failed one", () => {
    const html = panel(
      state({
        entries: [
          entry({ key: "local-1", id: null, status: "sending", body: "One" }),
          entry({
            key: "local-2",
            id: null,
            status: "failed",
            body: "Two",
            error: "Your message wasn't sent."
          }),
          entry({
            key: "3",
            direction: "outbound",
            body: "Hi!",
            authorName: "Sam"
          })
        ]
      })
    );
    assert.match(html, /Sending…/);
    assert.match(html, /Your message wasn&#x27;t sent\./);
    assert.match(html, />Retry<\/button>/);
    assert.match(html, /<span class="sr-only">Sam: <\/span>Hi!/);
    assert.match(html, /<span class="sr-only">You: <\/span>One/);
  });
});

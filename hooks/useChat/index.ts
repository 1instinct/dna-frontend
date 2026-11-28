import { useEffect, useState, useSyncExternalStore } from "react";
import { storefrontApi } from "../../lib/chat/api";
import { browserChatEnv } from "../../lib/chat/browser";
import {
  ConsentState,
  getConsent,
  subscribeConsent
} from "../../lib/chat/consent";
import { ChatSession, ChatState } from "../../lib/chat/session";
import {
  ensureVisitorToken,
  writeVisitorToken
} from "../../lib/chat/visitorToken";

/** The chat and tracking consent state (lib/chat/consent). */
export function useChatConsent(): ConsentState {
  return useSyncExternalStore(subscribeConsent, getConsent, getConsent);
}

/**
 * One chat session for the widget's lifetime, with its state. The session
 * polls only between `start` and `stop`, which the widget calls on mount and
 * unmount.
 */
export function useChatSession(): [ChatState, ChatSession] {
  const [session] = useState(
    () =>
      new ChatSession({
        api: storefrontApi,
        env: browserChatEnv(),
        getToken: () => ensureVisitorToken(),
        setToken: (token) => writeVisitorToken(token)
      })
  );
  const state = useSyncExternalStore(
    session.subscribe,
    session.getState,
    session.getState
  );
  useEffect(() => () => session.stop(), [session]);
  return [state, session];
}

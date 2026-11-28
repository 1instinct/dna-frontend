import React, { ComponentType } from "react";
import dynamic from "next/dynamic";
import { useChatConsent } from "../../hooks/useChat";
import { chatEnabled, visitorTrackingEnabled } from "../../lib/chat/config";

// Separate chunks, fetched only when their flag is on and consent allows it.
const LazyChatWidget = dynamic(
  () => import("./ChatWidget").then((m) => m.ChatWidget),
  { ssr: false }
);
const LazyVisitorTracking = dynamic(
  () => import("./VisitorTracking").then((m) => m.VisitorTracking),
  { ssr: false }
);

export interface StorefrontChatProps {
  /** Keep tracking but hide the widget (e.g. on full-screen pages). */
  hideWidget?: boolean;
  /** Overrides for tests. */
  widget?: ComponentType;
  tracker?: ComponentType;
}

/**
 * Mounts the chat widget (NEXT_PUBLIC_CHAT_ENABLED) and visit tracking
 * (NEXT_PUBLIC_VISITOR_TRACKING, default on with chat) once consent is granted
 * (lib/chat/consent). Renders nothing when both are off.
 */
export const StorefrontChat = ({
  hideWidget = false,
  widget: Widget = LazyChatWidget,
  tracker: Tracker = LazyVisitorTracking
}: StorefrontChatProps) => {
  const consent = useChatConsent();
  const chat = chatEnabled() && !hideWidget;
  const tracking = visitorTrackingEnabled();
  if (consent !== "granted" || (!chat && !tracking)) return null;
  return (
    <>
      {tracking ? <Tracker /> : null}
      {chat ? <Widget /> : null}
    </>
  );
};

export default StorefrontChat;

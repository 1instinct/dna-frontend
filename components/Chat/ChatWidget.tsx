import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { MessageCircle, Minus } from "lucide-react";
import { useChatSession } from "../../hooks/useChat";
import { cn } from "../../lib/utils";
import { ChatPanelBody } from "./ChatPanelBody";

export const CHAT_QUERY_PARAM = "chat";

const onlineText = (online: boolean | null) =>
  online === true
    ? "We're online."
    : online === false
    ? "We're away. Leave a message and we'll reply here, or by email if you add it."
    : "";

/**
 * The storefront chat: a launcher bubble fixed to the bottom corner that opens
 * a panel (a full-height sheet on phones). The panel is a modal dialog (focus
 * trap, Escape and the minimise button close it, focus returns to the
 * launcher). `?chat=<token>` from a "You have a reply" email opens it on that
 * conversation and is then removed from the address bar.
 *
 * Loaded through next/dynamic by StorefrontChat, only when
 * NEXT_PUBLIC_CHAT_ENABLED is on and consent allows it.
 */
export const ChatWidget = () => {
  const router = useRouter();
  const [state, session] = useChatSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const started = useRef(false);
  const linkToken =
    typeof router.query[CHAT_QUERY_PARAM] === "string"
      ? (router.query[CHAT_QUERY_PARAM] as string)
      : null;

  useEffect(() => {
    if (!router.isReady) return;
    if (!started.current) {
      started.current = true;
      void session.start(linkToken);
    } else if (linkToken) {
      void session.resumeFrom(linkToken);
    }
    if (linkToken) {
      // The token is a credential for the conversation: keep it out of the
      // address bar, history and anything the visitor shares.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [CHAT_QUERY_PARAM]: _token, ...query } = router.query;
      void router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false
      });
    }
    // Runs when the router is ready and whenever a new link token arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, linkToken]);

  // StrictMode and fast refresh unmount and remount: start again after a stop.
  useEffect(
    () => () => {
      started.current = false;
    },
    []
  );

  const unread = state.unread;
  const status = onlineText(state.online);

  return (
    <DialogPrimitive.Root
      open={state.open}
      onOpenChange={(open) => session.setOpen(open)}
    >
      <DialogPrimitive.Trigger
        className="fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:hidden sm:bottom-6 sm:right-6"
        aria-label={
          unread > 0
            ? `Open chat, ${unread} new message${unread === 1 ? "" : "s"}`
            : "Open chat"
        }
      >
        <MessageCircle aria-hidden="true" className="h-6 w-6" />
        {unread > 0 ? (
          <span
            aria-hidden="true"
            data-testid="chat-unread-dot"
            className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-destructive"
          />
        ) : null}
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          aria-describedby={status ? "chat-status" : undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            textareaRef.current?.focus();
          }}
          className={cn(
            "fixed inset-0 z-50 flex flex-col overflow-hidden bg-background text-foreground shadow-2xl focus:outline-none",
            "sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100vh-3rem))] sm:w-[380px] sm:rounded-xl sm:border sm:border-border",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4"
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-base font-semibold">
                Chat with us
              </DialogPrimitive.Title>
              {status ? (
                <DialogPrimitive.Description
                  id="chat-status"
                  className="mb-0 mt-0.5 flex items-center gap-1.5 text-xs opacity-90"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-block h-2 w-2 shrink-0 rounded-full",
                      state.online
                        ? "bg-green-light"
                        : "bg-primary-foreground/60"
                    )}
                  />
                  {status}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close
              aria-label="Minimise chat"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              <Minus aria-hidden="true" className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          {state.ready ? (
            <ChatPanelBody
              state={state}
              onSend={(input) => session.send(input)}
              onRetry={(key) => session.retry(key)}
              textareaRef={textareaRef}
            />
          ) : (
            <p
              role="status"
              className="m-0 flex flex-1 items-center justify-center text-sm text-muted-foreground"
            >
              Loading chat…
            </p>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default ChatWidget;

import React, {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { MESSAGE_MAX_LENGTH } from "../../lib/chat/api";
import type {
  ChatEntry,
  ChatState,
  SendInput,
  SendResult
} from "../../lib/chat/session";
import { cn } from "../../lib/utils";

export const DEFAULT_GREETING =
  "Hi! Ask us anything and we'll get back to you here.";

const COUNTER_FROM = MESSAGE_MAX_LENGTH - 500;

const fieldClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background aria-[invalid=true]:border-destructive";

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const senderName = (entry: ChatEntry) =>
  entry.direction === "inbound" ? "You" : entry.authorName || "Support";

const statusText = (entry: ChatEntry) => {
  switch (entry.status) {
    case "sending":
      return "Sending…";
    case "queued":
      return "Waiting to send…";
    case "failed":
      return entry.error || "Not sent.";
    default:
      return null;
  }
};

export interface ChatPanelBodyProps {
  state: ChatState;
  onSend(input: SendInput): SendResult;
  onRetry(key: string): void;
  /** Lets the dialog focus the message box when it opens. */
  textareaRef?: React.Ref<HTMLTextAreaElement>;
}

/**
 * The open chat panel below its header: greeting, messages, inline notices and
 * the composer (with the optional name and email fields before the first
 * message). Pure apart from its form state, so it renders in tests without the
 * dialog around it.
 */
export const ChatPanelBody = ({
  state,
  onSend,
  onRetry,
  textareaRef
}: ChatPanelBodyProps) => {
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<{
    field: "body" | "email";
    error: string;
  } | null>(null);
  const listEnd = useRef<HTMLLIElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const announced = useRef<string | null>(null);

  // Keep the newest message in view.
  useEffect(() => {
    listEnd.current?.scrollIntoView?.({ block: "end" });
  }, [state.entries.length]);

  // Announce staff replies that arrive while the panel is open, not the
  // history that was there when it opened.
  useEffect(() => {
    const replies = state.entries.filter((e) => e.direction === "outbound");
    const latest = replies[replies.length - 1];
    if (!latest) return;
    if (announced.current !== null && announced.current !== latest.key) {
      setAnnouncement(`${senderName(latest)} says: ${latest.body}`);
    }
    announced.current = latest.key;
  }, [state.entries]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const result = onSend({ body, name, email });
    if (result.ok) {
      setBody("");
      setFieldError(null);
    } else {
      setFieldError({ field: result.field, error: result.error });
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds a line (not while composing with an IME).
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const bodyError = fieldError?.field === "body" ? fieldError.error : null;
  const emailError = fieldError?.field === "email" ? fieldError.error : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <ol aria-label="Messages" className="flex flex-col gap-3">
          <li className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-foreground">
            <span className="sr-only">Support: </span>
            {state.greeting || DEFAULT_GREETING}
          </li>
          {state.entries.map((entry) => {
            const mine = entry.direction === "inbound";
            const status = statusText(entry);
            return (
              <li
                key={entry.key}
                className={cn(
                  "flex max-w-[85%] flex-col gap-1",
                  mine ? "items-end self-end" : "items-start self-start"
                )}
              >
                <div
                  className={cn(
                    "whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                    entry.status !== "sent" && "opacity-80"
                  )}
                >
                  <span className="sr-only">{senderName(entry)}: </span>
                  {entry.body}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {!mine && entry.authorName ? (
                    <span aria-hidden="true">{entry.authorName}</span>
                  ) : null}
                  {status ? (
                    <span
                      className={cn(
                        entry.status === "failed" && "text-destructive"
                      )}
                    >
                      {status}
                    </span>
                  ) : (
                    <time dateTime={entry.createdAt}>
                      {formatTime(entry.createdAt)}
                    </time>
                  )}
                  {entry.status === "failed" ? (
                    <button
                      type="button"
                      onClick={() => onRetry(entry.key)}
                      className="rounded font-medium text-foreground underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Retry
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
          <li ref={listEnd} aria-hidden="true" className="h-0" />
        </ol>
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {state.error ? (
        <p
          role="alert"
          className="mx-4 mb-2 mt-0 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-foreground"
        >
          {state.error}
        </p>
      ) : null}
      {state.notice ? (
        <p
          role="status"
          className="mx-4 mb-2 mt-0 rounded-md bg-muted px-3 py-2 text-xs text-foreground"
        >
          {state.notice}
        </p>
      ) : null}

      <form
        onSubmit={submit}
        noValidate
        className="flex flex-col gap-2 border-t border-border px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
      >
        {state.askContact ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs text-muted-foreground">
              Optional: your name and email, so we can reply by email.
            </legend>
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="chat-name" className="sr-only">
                  Name (optional)
                </label>
                <input
                  id="chat-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Name"
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="chat-email" className="sr-only">
                  Email (optional)
                </label>
                <input
                  id="chat-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setFieldError(null);
                  }}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? "chat-email-error" : undefined}
                  className={fieldClass}
                />
              </div>
            </div>
            {emailError ? (
              <p id="chat-email-error" className="m-0 text-xs text-destructive">
                {emailError}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="chat-message" className="sr-only">
              Message
            </label>
            <textarea
              id="chat-message"
              ref={textareaRef}
              name="message"
              rows={2}
              placeholder="Write a message…"
              maxLength={MESSAGE_MAX_LENGTH}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (bodyError) setFieldError(null);
              }}
              onKeyDown={onKeyDown}
              aria-invalid={bodyError ? true : undefined}
              aria-describedby={
                bodyError
                  ? "chat-message-error"
                  : body.length >= COUNTER_FROM
                  ? "chat-message-count"
                  : undefined
              }
              className={cn(fieldClass, "max-h-32 min-h-[2.75rem] resize-none")}
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Send
          </button>
        </div>
        {bodyError ? (
          <p id="chat-message-error" className="m-0 text-xs text-destructive">
            {bodyError}
          </p>
        ) : body.length >= COUNTER_FROM ? (
          <p
            id="chat-message-count"
            className="m-0 text-xs text-muted-foreground"
          >
            {MESSAGE_MAX_LENGTH - body.length} characters left
          </p>
        ) : null}
      </form>
    </div>
  );
};

export default ChatPanelBody;

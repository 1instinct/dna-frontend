import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@lib/utils";

interface ChatMessage {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  timestamp: Date;
  isStreamer?: boolean;
  reaction?: string;
}

interface StreamChatProps {
  streamId?: string;
  streamerName?: string;
  className?: string;
}

const REACTION_EMOJIS = [
  "\u2764\uFE0F",
  "\uD83D\uDD25",
  "\uD83D\uDC8E",
  "\u2728",
  "\uD83D\uDC4F"
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    user: "GemLover22",
    text: "That sapphire is gorgeous!",
    timestamp: new Date(Date.now() - 180000),
    reaction: "\uD83D\uDC8E"
  },
  {
    id: "2",
    user: "Jane Doe",
    text: "Thank you! It\u2019s a 2.3ct Ceylon blue sapphire, ethically sourced from Sri Lanka.",
    timestamp: new Date(Date.now() - 150000),
    isStreamer: true
  },
  {
    id: "3",
    user: "RingQueen",
    avatar: "/3.png",
    text: "Can you show it in natural light?",
    timestamp: new Date(Date.now() - 120000)
  },
  {
    id: "4",
    user: "Jane Doe",
    text: "Of course! Moving to the window now...",
    timestamp: new Date(Date.now() - 90000),
    isStreamer: true
  },
  {
    id: "5",
    user: "DiamondDave",
    text: "What\u2019s the price range for custom settings?",
    timestamp: new Date(Date.now() - 60000)
  },
  {
    id: "6",
    user: "BrideTooBe",
    text: "I\u2019ve been looking for exactly this \u2764\uFE0F",
    timestamp: new Date(Date.now() - 30000),
    reaction: "\u2764\uFE0F"
  }
];

// Floating reaction that animates upward then fades
const FloatingReaction: React.FC<{
  emoji: string;
  onComplete: () => void;
}> = ({ emoji, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const randomX = Math.random() * 60 - 30; // -30 to 30px horizontal drift

  return (
    <div
      className="pointer-events-none absolute bottom-0 right-4 animate-float-up text-2xl"
      style={
        {
          "--drift-x": `${randomX}px`
        } as React.CSSProperties
      }
    >
      {emoji}
    </div>
  );
};

export const StreamChat: React.FC<StreamChatProps> = ({
  streamId,
  streamerName = "Streamer",
  className
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [floatingReactions, setFloatingReactions] = useState<
    { id: string; emoji: string }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      text: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleReaction = (emoji: string) => {
    const reactionId = Date.now().toString() + Math.random();
    setFloatingReactions((prev) => [...prev, { id: reactionId, emoji }]);
  };

  const removeReaction = useCallback((id: string) => {
    setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getInitialColor = (name: string) => {
    const hue =
      name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };

  return (
    <div className={cn("relative flex h-full flex-col", className)}>
      {/* Top fade — messages dissolve into darkness */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-[#0a0a0a] to-transparent" />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2">
        <div className="flex flex-col gap-1 pt-6">
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={cn(
                "group flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.03]",
                i === messages.length - 1 && "animate-fade-up"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                  msg.isStreamer && "ring-1 ring-brand"
                )}
                style={{ background: getInitialColor(msg.user) }}
              >
                {msg.user.charAt(0).toUpperCase()}
              </div>

              {/* Message content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "truncate font-mono-semibold text-[11px] tracking-wide",
                      msg.isStreamer ? "text-brand" : "text-white/70"
                    )}
                  >
                    {msg.user}
                    {msg.isStreamer && (
                      <span className="ml-1 inline-block rounded bg-brand/20 px-1 py-px text-[9px] font-bold uppercase tracking-widest text-brand">
                        Host
                      </span>
                    )}
                  </span>
                  <span className="flex-shrink-0 text-[10px] text-white/25">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="m-0 break-words font-body text-[13px] leading-[1.4] text-white/90">
                  {msg.text}
                  {msg.reaction && (
                    <span className="ml-1 text-sm">{msg.reaction}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reactions bar + Input */}
      <div className="relative border-t border-white/[0.06] bg-black/40">
        {/* Floating reactions container */}
        <div className="pointer-events-none absolute inset-x-0 bottom-full h-32 overflow-hidden">
          {floatingReactions.map((r) => (
            <FloatingReaction
              key={r.id}
              emoji={r.emoji}
              onComplete={() => removeReaction(r.id)}
            />
          ))}
        </div>

        {/* Quick reactions */}
        <div className="flex items-center gap-1 px-3 pt-2">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="rounded-full px-1.5 py-0.5 text-base transition-all hover:scale-125 hover:bg-white/10 active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Message input */}
        <div className="flex items-center gap-2 p-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Say something..."
            className="flex-1 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 font-body text-[13px] text-white placeholder:text-white/30 focus:border-brand/40 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all",
              inputValue.trim()
                ? "bg-brand text-white hover:bg-brand/80 active:scale-90"
                : "bg-white/10 text-white/30"
            )}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

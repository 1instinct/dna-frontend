import React, { useRef, useEffect, useState } from "react";
import { cn } from "@lib/utils";

interface TranscriptEntry {
  id: string;
  timestamp: string; // "MM:SS" format
  speaker: string;
  text: string;
  isProductMention?: boolean;
  productSlug?: string;
}

interface StreamTranscriptProps {
  streamId?: string;
  className?: string;
  onSeek?: (timeSeconds: number) => void;
}

const MOCK_TRANSCRIPT: TranscriptEntry[] = [
  {
    id: "t1",
    timestamp: "00:00",
    speaker: "Jane Doe",
    text: "Welcome everyone to today\u2019s live showcase! We have some incredible pieces to show you."
  },
  {
    id: "t2",
    timestamp: "00:15",
    speaker: "Jane Doe",
    text: "Let\u2019s start with this stunning Ceylon blue sapphire. It\u2019s a 2.3 carat stone, ethically sourced from Sri Lanka.",
    isProductMention: true,
    productSlug: "ceylon-sapphire-ring"
  },
  {
    id: "t3",
    timestamp: "00:42",
    speaker: "Jane Doe",
    text: "Notice the depth of color here \u2014 this is what we call a \u2018royal blue\u2019 saturation. The cut maximizes brilliance from every angle."
  },
  {
    id: "t4",
    timestamp: "01:10",
    speaker: "Jane Doe",
    text: "Moving on to our signature rose gold collection. These bands are handcrafted in our studio.",
    isProductMention: true,
    productSlug: "rose-gold-band"
  },
  {
    id: "t5",
    timestamp: "01:35",
    speaker: "Jane Doe",
    text: "Each piece goes through a 12-step finishing process. You can see the mirror polish catching the light."
  },
  {
    id: "t6",
    timestamp: "02:00",
    speaker: "Jane Doe",
    text: "Someone asked about custom settings \u2014 yes, we offer fully bespoke designs. DM me or add to cart and note your preferences."
  },
  {
    id: "t7",
    timestamp: "02:28",
    speaker: "Jane Doe",
    text: "This diamond pendant is new to the collection. Lab-grown, VS1 clarity, and the chain is 18k Italian gold.",
    isProductMention: true,
    productSlug: "diamond-pendant"
  },
  {
    id: "t8",
    timestamp: "03:05",
    speaker: "Jane Doe",
    text: "Last chance on the sapphire at this price \u2014 we only have two left in stock!"
  }
];

export const StreamTranscript: React.FC<StreamTranscriptProps> = ({
  streamId,
  className,
  onSeek
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [autoScroll]);

  const handleTimestampClick = (entry: TranscriptEntry) => {
    setActiveId(entry.id);

    // Parse "MM:SS" to seconds
    const parts = entry.timestamp.split(":");
    const seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    onSeek?.(seconds);

    // Clear highlight after 3s
    setTimeout(() => setActiveId(null), 3000);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 60;
    setAutoScroll(isNearBottom);
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-brand" />
          <span className="font-mono-semibold text-[11px] uppercase tracking-widest text-white/50">
            Live Transcript
          </span>
        </div>
        {!autoScroll && (
          <button
            onClick={() => {
              setAutoScroll(true);
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-full bg-white/10 px-2.5 py-1 font-mono-semibold text-[10px] uppercase tracking-wider text-white/60 transition-all hover:bg-white/20 hover:text-white"
          >
            Jump to live
          </button>
        )}
      </div>

      {/* Transcript entries */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2"
      >
        <div className="flex flex-col gap-0.5">
          {MOCK_TRANSCRIPT.map((entry, i) => (
            <div
              key={entry.id}
              className={cn(
                "group relative flex gap-3 rounded-lg px-2 py-2 transition-all duration-300",
                activeId === entry.id
                  ? "bg-brand/10 shadow-[inset_0_0_20px_rgba(235,139,139,0.05)]"
                  : "hover:bg-white/[0.03]",
                "animate-fade-up"
              )}
              style={{
                animationDelay: `${i * 50}ms`,
                animationFillMode: "both"
              }}
            >
              {/* Timestamp pill */}
              <button
                onClick={() => handleTimestampClick(entry)}
                className="mt-0.5 flex h-5 flex-shrink-0 items-center rounded bg-white/[0.06] px-1.5 font-mono-semibold text-[10px] tabular-nums text-white/40 transition-all hover:bg-brand/20 hover:text-brand"
              >
                {entry.timestamp}
              </button>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "m-0 font-body text-[13px] leading-[1.5] text-white/80",
                    entry.isProductMention && "border-l-2 border-brand/40 pl-2"
                  )}
                >
                  {entry.text}
                </p>

                {entry.isProductMention && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-brand/[0.08] px-2.5 py-1 shadow-[0_0_12px_rgba(235,139,139,0.06)] transition-all hover:bg-brand/15 hover:shadow-[0_0_16px_rgba(235,139,139,0.12)]">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-brand"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <span className="font-mono-semibold text-[10px] uppercase tracking-wider text-brand/80">
                      Product mentioned
                    </span>
                  </div>
                )}
              </div>

              {/* Vertical timeline line */}
              {i < MOCK_TRANSCRIPT.length - 1 && (
                <div className="absolute left-[29px] top-[28px] h-[calc(100%-12px)] w-px bg-white/[0.06]" />
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

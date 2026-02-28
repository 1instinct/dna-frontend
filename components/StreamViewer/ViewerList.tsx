import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@lib/utils";

interface Viewer {
  id: string;
  name: string;
  avatar?: string;
}

interface ViewerListProps {
  viewers: Viewer[];
  isLive?: boolean;
  compact?: boolean;
}

export const ViewerList: React.FC<ViewerListProps> = ({
  viewers = [],
  isLive = false,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleAvatars = viewers.slice(0, compact ? 2 : 3);
  const remainingCount = Math.max(0, viewers.length - (compact ? 2 : 3));

  // ── Compact variant: inline viewer count for the streamer info bar ──
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-1.5">
          {visibleAvatars.map((viewer) => (
            <div
              key={viewer.id}
              className="h-4 w-4 overflow-hidden rounded-full border border-black bg-muted"
            >
              {viewer.avatar ? (
                <Image
                  src={viewer.avatar}
                  alt={viewer.name}
                  width={16}
                  height={16}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-[7px] font-bold text-white"
                  style={{
                    background: `hsl(${viewer.id.charCodeAt(0) * 10}, 70%, 60%)`
                  }}
                >
                  {viewer.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>
        <span className="font-mono-semibold text-[10px] tabular-nums text-white/40">
          {viewers.length} watching
        </span>
      </div>
    );
  }

  // ── Full variant: expandable viewer list ──
  return (
    <>
      <div
        className="relative z-50 flex cursor-pointer items-center gap-3 rounded-3xl border border-white/10 bg-black/50 px-4 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-[20px] transition-all hover:bg-black/70"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isLive && (
          <div className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
        )}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {viewers.length}
        </div>
        <div
          className={cn(
            "-ml-1 flex flex-shrink-0 items-center overflow-hidden transition-all",
            isExpanded ? "max-w-[200px]" : "max-w-[120px]"
          )}
        >
          {visibleAvatars.map((viewer) => (
            <div
              key={viewer.id}
              className="relative -ml-2 h-8 w-8 overflow-hidden rounded-full border-2 border-black bg-muted first:-ml-0"
            >
              {viewer.avatar ? (
                <Image
                  src={viewer.avatar}
                  alt={viewer.name}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-xs font-bold text-white"
                  style={{
                    background: `hsl(${viewer.id.charCodeAt(0) * 10}, 70%, 60%)`
                  }}
                >
                  {viewer.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="relative -ml-2 h-8 w-8 overflow-hidden rounded-full border-2 border-black bg-muted">
              <div className="flex h-full w-full items-center justify-center bg-black/60 text-[11px] font-bold text-white">
                +{remainingCount}
              </div>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 min-w-[200px] max-h-[300px] overflow-y-auto rounded-xl border border-white/10 bg-black/90 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-[20px]">
          {viewers.map((viewer) => (
            <div
              key={viewer.id}
              className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-white/10"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-black bg-muted">
                {viewer.avatar ? (
                  <Image
                    src={viewer.avatar}
                    alt={viewer.name}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: `hsl(${
                        viewer.id.charCodeAt(0) * 10
                      }, 70%, 60%)`
                    }}
                  >
                    {viewer.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-sm text-white">{viewer.name}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

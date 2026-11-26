import React, { useId, useState } from "react";
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
}

export const ViewerList: React.FC<ViewerListProps> = ({
  viewers = [],
  isLive = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const listId = useId();

  const visibleAvatars = viewers.slice(0, 3);
  const remainingCount = Math.max(0, viewers.length - 3);

  const viewerCount = `${viewers.length} ${
    viewers.length === 1 ? "viewer" : "viewers"
  }`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape" && isExpanded) {
      e.preventDefault();
      setIsExpanded(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={listId}
        aria-label={isLive ? `Live, ${viewerCount}` : viewerCount}
        className="relative z-50 flex cursor-pointer items-center gap-3 rounded-3xl border border-white/10 bg-black/50 px-4 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-[20px] transition-all hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={handleKeyDown}
      >
        {isLive && (
          <span className="block h-2 w-2 animate-pulse rounded-full bg-destructive" />
        )}
        <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <span aria-hidden="true">👁️</span> {viewers.length}
        </span>
        <span
          className={cn(
            "-ml-1 flex flex-shrink-0 items-center overflow-hidden transition-all",
            isExpanded ? "max-w-[200px]" : "max-w-[120px]"
          )}
        >
          {visibleAvatars.map((viewer) => (
            <span
              key={viewer.id}
              className="relative -ml-2 block h-8 w-8 overflow-hidden rounded-full border-2 border-black bg-muted first:-ml-0"
            >
              {viewer.avatar ? (
                <Image
                  src={viewer.avatar}
                  alt=""
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center text-xs font-bold text-white"
                  style={{
                    background: `hsl(${viewer.id.charCodeAt(0) * 10}, 70%, 60%)`
                  }}
                >
                  {viewer.name.charAt(0).toUpperCase()}
                </span>
              )}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="relative -ml-2 block h-8 w-8 overflow-hidden rounded-full border-2 border-black bg-muted">
              <span className="flex h-full w-full items-center justify-center bg-black/60 text-[11px] font-bold text-white">
                +{remainingCount}
              </span>
            </span>
          )}
        </span>
      </button>

      {isExpanded && (
        <ul
          id={listId}
          aria-label="Viewers"
          className="absolute right-0 top-full m-0 mt-2 min-w-[200px] max-h-[300px] list-none overflow-y-auto rounded-xl border border-white/10 bg-black/90 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-[20px]"
        >
          {viewers.map((viewer) => (
            <li
              key={viewer.id}
              className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-white/10"
            >
              <div
                aria-hidden="true"
                className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-black bg-muted"
              >
                {viewer.avatar ? (
                  <Image
                    src={viewer.avatar}
                    alt=""
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
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

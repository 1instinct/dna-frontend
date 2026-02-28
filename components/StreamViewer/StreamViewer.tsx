import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import moment from "moment";
import { useStream } from "@hooks/useStream";
import { useProducts } from "@hooks/useProducts";
import { ProductMiniCard } from "./ProductMiniCard";
import { StreamCheckout } from "./StreamCheckout";
import { ViewerList } from "./ViewerList";
import { StreamChat } from "./StreamChat";
import { StreamTranscript } from "./StreamTranscript";
import { VideoJS } from "../VideoJS";
import { cn } from "@lib/utils";

type TabId = "products" | "chat" | "transcript";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "products",
    label: "Shop",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    )
  },
  {
    id: "chat",
    label: "Chat",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    )
  },
  {
    id: "transcript",
    label: "Transcript",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  }
];

export const StreamViewer = ({ props }: any) => {
  const router = useRouter();
  const { streamId } = router.query;
  const [videoError, setVideoError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("products");
  const [panelExpanded, setPanelExpanded] = useState(false);

  const playerRef = useRef<any>(null);

  const { data: streamData, isLoading: streamLoading } = useStream(
    streamId as string
  );
  const { data: productsData } = useProducts(1);

  const isLive = streamData?.status === "live" || streamData?.is_active;
  const streamStartDate = streamData?.start_date
    ? moment(streamData.start_date)
    : null;

  const videoJsOptions = streamId
    ? {
        autoplay: isLive,
        controls: true,
        responsive: true,
        fluid: true,
        liveui: isLive,
        sources: [
          {
            src: `https://stream.mux.com/${streamId}.m3u8`,
            type: "application/x-mpegURL"
          }
        ]
      }
    : null;

  const handlePlayerReady = useCallback((player: any) => {
    playerRef.current = player;

    player.on("error", () => {
      setVideoError(true);
    });
  }, []);

  const handleRetry = () => {
    setVideoError(false);
    if (playerRef.current) {
      playerRef.current.src(videoJsOptions?.sources);
      playerRef.current.load();
    }
  };

  const handleSeek = useCallback((timeSeconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime(timeSeconds);
    }
  }, []);

  const streamerInfo = {
    name: streamData?.streamer_name || "Jane Doe",
    avatar: streamData?.streamer_avatar || "/1.png",
    profileUrl: streamData?.streamer_url || "/profile/janedoe"
  };

  const featuredProducts = productsData?.data?.slice(0, 8) || [];

  const mockViewers = [
    { id: "1", name: "Alice Johnson", avatar: "/1.png" },
    { id: "2", name: "Bob Smith" },
    { id: "3", name: "Carol Davis", avatar: "/3.png" },
    { id: "4", name: "David Wilson" },
    { id: "5", name: "Emma Brown" }
  ];

  // ── Loading state ──────────────────────────────────────────────
  if (streamLoading) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-brand" />
          <span className="font-mono-semibold text-[11px] uppercase tracking-widest text-white/40">
            Loading stream
          </span>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[1000] flex h-[100dvh] w-full flex-col bg-black md:flex-row">
      {/* ═══ VIDEO SECTION ═══ */}
      <div className="relative flex-shrink-0 md:flex-1">
        {/* Top gradient overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/70 to-transparent" />

        {/* Bottom gradient overlay (mobile only) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/60 to-transparent md:hidden" />

        {/* Close button */}
        <button
          onClick={() => router.back()}
          aria-label="Close stream"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-lg text-white/80 backdrop-blur-xl transition-all hover:scale-105 hover:bg-black/70 hover:text-white active:scale-95 md:right-5 md:top-5 md:h-11 md:w-11"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Streamer info overlay */}
        <div className="absolute left-3 top-3 z-20 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-xl md:left-5 md:top-5 md:gap-3 md:px-4 md:py-2.5">
          {/* Live badge */}
          {isLive && (
            <div className="flex items-center gap-1.5 rounded-full bg-red/90 px-2 py-0.5">
              <div className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-white" />
              <span className="font-mono-bold text-[9px] uppercase tracking-widest text-white">
                Live
              </span>
            </div>
          )}

          {/* Avatar */}
          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-brand/60 md:h-9 md:w-9">
            <Image
              src={streamerInfo.avatar}
              alt={streamerInfo.name}
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Name + viewers */}
          <div className="flex flex-col">
            <span className="font-title text-[12px] leading-tight text-white md:text-[13px]">
              {streamerInfo.name}
            </span>
            <ViewerList viewers={mockViewers} isLive={isLive} compact />
          </div>
        </div>

        {/* Video player */}
        <div className="relative h-full w-full bg-black">
          {videoError ? (
            <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 text-4xl opacity-60">&#x26A0;&#xFE0F;</div>
              <p className="mb-5 max-w-[300px] font-body text-[13px] leading-relaxed text-white/60">
                The stream could not be loaded. Please check your connection and
                try again.
              </p>
              <button
                onClick={handleRetry}
                className="rounded-full bg-brand px-5 py-2 font-mono-semibold text-[11px] uppercase tracking-wider text-white transition-all hover:bg-brand/80 active:scale-95"
              >
                Retry
              </button>
            </div>
          ) : (
            <VideoJS
              options={videoJsOptions}
              onReady={handlePlayerReady}
              className="h-full w-full cursor-pointer [&_.vjs-big-play-button]:!border-brand/50 [&_.vjs-big-play-button]:!bg-black/60"
            />
          )}
        </div>
      </div>

      {/* ═══ CONTENT PANEL ═══ */}
      <div
        className={cn(
          "relative flex flex-1 flex-col overflow-hidden border-t border-white/[0.06] bg-[#0a0a0a] transition-all md:max-w-[380px] md:border-l md:border-t-0",
          panelExpanded && "max-sm:absolute max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-[30%] max-sm:z-30 max-sm:rounded-t-2xl"
        )}
      >
        {/* Drag handle (mobile) */}
        <div
          className="flex cursor-grab items-center justify-center py-2 active:cursor-grabbing md:hidden"
          onClick={() => setPanelExpanded(!panelExpanded)}
        >
          <div className="h-1 w-8 rounded-full bg-white/20" />
        </div>

        {/* Tab bar */}
        <div className="relative flex flex-shrink-0 border-b border-white/[0.06]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 px-3 py-3 transition-all md:py-3.5",
                activeTab === tab.id
                  ? "text-white"
                  : "text-white/35 hover:text-white/60"
              )}
            >
              {tab.icon}
              <span className="font-mono-semibold text-[10px] uppercase tracking-[0.15em] md:text-[11px]">
                {tab.label}
              </span>

              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-brand transition-all" />
              )}

              {/* Product count badge */}
              {tab.id === "products" && featuredProducts.length > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand/20 px-1 text-[9px] font-bold text-brand">
                  {featuredProducts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {/* Products tab */}
          {activeTab === "products" && (
            <div className="flex h-full flex-col animate-fade-in">
              {/* Horizontal scroll on mobile, vertical list on desktop */}
              <div className="relative flex-1 overflow-y-auto scrollbar-hide">
                {/* Mobile: horizontal product strip with fade edges */}
                <div className="relative sm:hidden">
                  <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent" />
                  <div className="flex gap-3 overflow-x-auto px-3 py-3 scrollbar-hide">
                    {featuredProducts.map((product: any, i: number) => (
                      <div
                        key={product.id}
                        className="w-[160px] flex-shrink-0 animate-fade-up"
                        style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                      >
                        <ProductMiniCard product={product} variant="compact" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop / tablet: vertical list with staggered reveal */}
                <div className="hidden flex-col gap-2.5 p-3 sm:flex">
                  {featuredProducts.map((product: any, i: number) => (
                    <div
                      key={product.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                    >
                      <ProductMiniCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat tab */}
          {activeTab === "chat" && (
            <div className="h-full animate-fade-in">
              <StreamChat
                streamId={streamId as string}
                streamerName={streamerInfo.name}
              />
            </div>
          )}

          {/* Transcript tab */}
          {activeTab === "transcript" && (
            <div className="h-full animate-fade-in">
              <StreamTranscript
                streamId={streamId as string}
                onSeek={handleSeek}
              />
            </div>
          )}
        </div>
      </div>

      {/* ═══ FLOATING CHECKOUT ═══ */}
      <StreamCheckout />
    </div>
  );
};

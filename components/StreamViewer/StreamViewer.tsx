import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import moment from "moment";
import { useStream } from "@hooks/useStream";
import { useProducts } from "@hooks/useProducts";
import { ProductMiniCard } from "./ProductMiniCard";
import { StreamCheckout } from "./StreamCheckout";
import { ViewerList } from "./ViewerList";
import { VideoJS } from "../VideoJS";
import { cn } from "@lib/utils";

export const StreamViewer = ({ props }: any) => {
  const router = useRouter();
  const { streamId } = router.query;
  const [videoError, setVideoError] = useState(false);

  const playerRef = React.useRef(null);

  const { data: streamData, isLoading: streamLoading } = useStream(
    streamId as string
  );
  const { data: productsData } = useProducts(1);

  const isLive = streamData?.status === "live" || streamData?.is_active;
  const streamStartDate = streamData?.start_date
    ? moment(streamData.start_date)
    : null;
  const isPast = streamStartDate ? moment().isAfter(streamStartDate) : false;

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

  const handlePlayerReady = (player: any) => {
    playerRef.current = player;

    player.on("waiting", () => {
      console.log("player is waiting");
    });

    player.on("error", (error: any) => {
      console.error("Video player error:", error);
      setVideoError(true);
    });

    player.on("dispose", () => {
      console.log("player will dispose");
    });
  };

  const handleRetry = () => {
    setVideoError(false);
    if (playerRef.current) {
      (playerRef.current as any).src(videoJsOptions?.sources);
      (playerRef.current as any).load();
    }
  };

  const streamerInfo = {
    name: streamData?.streamer_name || "Jane Doe",
    avatar: streamData?.streamer_avatar || "/1.png",
    profileUrl: streamData?.streamer_url || "/profile/janedoe"
  };

  const featuredProducts = productsData?.data?.slice(0, 5) || [];

  const mockViewers = [
    { id: "1", name: "Alice Johnson", avatar: "/1.png" },
    { id: "2", name: "Bob Smith" },
    { id: "3", name: "Carol Davis", avatar: "/3.png" },
    { id: "4", name: "David Wilson" },
    { id: "5", name: "Emma Brown" }
  ];

  if (streamLoading) {
    return (
      <div className="fixed inset-0 z-[1000] grid h-screen w-full grid-cols-[1fr_320px] grid-rows-[auto_1fr] gap-5 bg-black/95 p-5 backdrop-blur-[15px] lg:grid-cols-1 lg:grid-rows-[auto_auto_1fr] lg:gap-3 lg:p-3">
        <div className="flex h-screen items-center justify-center text-white">
          Loading stream...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] grid h-screen w-full grid-cols-[1fr_320px] grid-rows-[auto_1fr] gap-5 bg-black/95 p-5 backdrop-blur-[15px] max-lg:grid-cols-1 max-lg:grid-rows-[auto_auto_1fr] max-lg:gap-3 max-lg:p-3">
      {/* Header fade */}
      <div className="pointer-events-none absolute left-0 top-0 z-[1] h-[120px] w-full bg-gradient-to-b from-black/50 to-transparent" />

      {/* Close button */}
      <button
        onClick={() => router.back()}
        aria-label="Close stream"
        className="absolute right-[60px] top-5 z-[100] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/60 text-2xl text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] backdrop-blur-[20px] transition-all hover:scale-105 hover:bg-black/80 active:scale-95 max-lg:right-3 max-lg:top-3 max-lg:h-10 max-lg:w-10 max-lg:text-xl"
      >
        &times;
      </button>

      {/* Streamer Info with Viewer List */}
      <div className="z-10 col-start-1 row-start-1 m-5 flex max-w-[400px] flex-col items-start gap-3 self-start justify-self-start rounded-xl border border-white/10 bg-black/60 px-5 py-4 backdrop-blur-[20px] max-lg:max-w-full">
        <ViewerList viewers={mockViewers} isLive={isLive} />

        <div className="flex w-full items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-brand">
            <Image
              src={streamerInfo.avatar}
              alt={streamerInfo.name}
              width={48}
              height={48}
              style={{ borderRadius: "50%" }}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="m-0 truncate text-lg font-semibold text-white">
              {streamerInfo.name}
            </h2>
            <a
              onClick={() => router.push(streamerInfo.profileUrl)}
              className="cursor-pointer text-[13px] text-brand transition-colors hover:text-brand/80"
            >
              View Profile &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="col-start-1 row-start-2 flex items-center justify-center overflow-hidden rounded-xl">
        {videoError ? (
          <div className="flex w-full flex-col items-center justify-center rounded-xl bg-black/80 p-10 text-center">
            <div className="mb-5 text-6xl animate-[shake_0.5s]">⚠️</div>
            <p className="mb-6 max-w-[400px] text-base leading-relaxed text-white">
              The media could not be loaded, either because the server or
              network failed or because the format is not supported.
            </p>
            <button
              onClick={handleRetry}
              className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand/80 active:translate-y-0"
            >
              Retry
            </button>
          </div>
        ) : (
          <VideoJS
            options={videoJsOptions}
            onReady={handlePlayerReady}
            className="h-auto w-full max-w-full cursor-pointer"
          />
        )}
      </div>

      {/* Product Sidebar */}
      <div className="col-start-2 row-span-full mr-2.5 mt-[60px] mb-10 flex max-h-[calc(100vh-100px)] flex-col overflow-hidden rounded-xl border border-white/10 bg-black/60 p-5 backdrop-blur-[20px] max-lg:col-start-1 max-lg:row-start-3 max-lg:mt-0 max-lg:mb-3 max-lg:max-h-[300px]">
        <h3 className="m-0 mb-4 text-base font-semibold text-white">
          Featured Products
        </h3>
        <div className="flex flex-col gap-3 overflow-y-auto pr-2">
          {featuredProducts.map((product: any) => (
            <ProductMiniCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Floating Checkout */}
      <StreamCheckout />
    </div>
  );
};

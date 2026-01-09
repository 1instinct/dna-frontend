import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import moment from "moment";
import { useStream } from "@hooks/useStream";
import { useProducts } from "@hooks/useProducts";
import { ProductMiniCard } from "./ProductMiniCard";
import { StreamCheckout } from "./StreamCheckout";
import { ViewerList } from "./ViewerList";

import {
  StreamViewerWrapper,
  StreamVideo,
  StreamHeaderFade,
  CloseButton,
  StreamerInfo,
  StreamerRow,
  StreamerAvatar,
  StreamerDetails,
  StreamerName,
  StreamerLink,
  ProductSidebar,
  ProductList,
  ProductListTitle,
  VideoContainer,
  ErrorPlaceholder,
  ErrorIcon,
  ErrorMessage,
  RetryButton
} from "./StreamViewer.styles";

export const StreamViewer = ({ props }: any) => {
  const router = useRouter();
  const { streamId } = router.query;
  const [videoError, setVideoError] = useState(false);

  const playerRef = React.useRef(null);

  // Fetch stream data to get streamer info
  const { data: streamData, isLoading: streamLoading } = useStream(
    streamId as string
  );

  // Fetch products featured in the stream
  const { data: productsData } = useProducts(1);

  // Determine if stream is live or past
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

  // Mock streamer data - replace with actual API data
  const streamerInfo = {
    name: streamData?.streamer_name || "Jane Doe",
    avatar: streamData?.streamer_avatar || "/1.png",
    profileUrl: streamData?.streamer_url || "/profile/janedoe"
  };

  const featuredProducts = productsData?.data?.slice(0, 5) || [];

  // Mock viewer data - replace with real-time viewer data from API
  const mockViewers = [
    { id: "1", name: "Alice Johnson", avatar: "/1.png" },
    { id: "2", name: "Bob Smith" },
    { id: "3", name: "Carol Davis", avatar: "/3.png" },
    { id: "4", name: "David Wilson" },
    { id: "5", name: "Emma Brown" }
  ];

  if (streamLoading) {
    return (
      <StreamViewerWrapper>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "white"
          }}
        >
          Loading stream...
        </div>
      </StreamViewerWrapper>
    );
  }

  return (
    <StreamViewerWrapper>
      <StreamHeaderFade />
      <CloseButton onClick={() => router.back()} aria-label="Close stream">
        ×
      </CloseButton>

      {/* Streamer Info with Viewer List */}
      <StreamerInfo>
        <ViewerList viewers={mockViewers} isLive={isLive} />

        <StreamerRow>
          <StreamerAvatar>
            <Image
              src={streamerInfo.avatar}
              alt={streamerInfo.name}
              width={48}
              height={48}
              style={{ borderRadius: "50%" }}
            />
          </StreamerAvatar>
          <StreamerDetails>
            <StreamerName>{streamerInfo.name}</StreamerName>
            <StreamerLink onClick={() => router.push(streamerInfo.profileUrl)}>
              View Profile →
            </StreamerLink>
          </StreamerDetails>
        </StreamerRow>
      </StreamerInfo>

      {/* Video Player */}
      <VideoContainer>
        {videoError ? (
          <ErrorPlaceholder>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorMessage>
              The media could not be loaded, either because the server or
              network failed or because the format is not supported.
            </ErrorMessage>
            <RetryButton onClick={handleRetry}>Retry</RetryButton>
          </ErrorPlaceholder>
        ) : (
          <StreamVideo options={videoJsOptions} onReady={handlePlayerReady} />
        )}
      </VideoContainer>

      {/* Product Sidebar */}
      <ProductSidebar>
        <ProductListTitle>Featured Products</ProductListTitle>
        <ProductList>
          {featuredProducts.map((product: any) => (
            <ProductMiniCard key={product.id} product={product} />
          ))}
        </ProductList>
      </ProductSidebar>

      {/* Floating Checkout */}
      <StreamCheckout />
    </StreamViewerWrapper>
  );
};

// import { useEffect, useRef } from 'react';
// import videojs from 'video.js';
// import Hls from 'hls.js';
// import { StreamViewerWrapper, StreamVideo } from './StreamViewer.styles';
// import "video.js/dist/video-js.css";

// export const StreamViewer = ({ src, poster }: any) => {
//   const videoRef = useRef<HTMLVideoElement>(null);

//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     video.controls = true
//     let hls: any

//     if (video.canPlayType('application/vnd.apple.mpegurl')) {
//       // This will run in safari, where HLS is supported natively
//       // video.src = src
//       // video.src = 'https://stream.mux.com/c2yVkaTxlAr402RakTmOP1sSpyQ5ENMPo5zOGKR7aWKo.m3u8'
//       video.src = 'https://stream.mux.com/ZH4K9sCgB02BNwBNshJ8cAgppZiwXXzEbvLDAI00rtgM4.m3u8'
//     } else if (Hls.isSupported()) {
//       // This will run in all other modern browsers
//       hls = new Hls()
//       // hls.loadSource('https://stream.mux.com/c2yVkaTxlAr402RakTmOP1sSpyQ5ENMPo5zOGKR7aWKo.m3u8')
//       hls.loadSource('https://stream.mux.com/ZH4K9sCgB02BNwBNshJ8cAgppZiwXXzEbvLDAI00rtgM4.m3u8')
//       hls.attachMedia(video)
//     } else {
//       console.error(
//         'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API'
//       )
//     }

//     return () => {
//       if (hls) {
//         hls.destroy()
//       }
//     }
//   }, [src, videoRef])

//   return (
//     <StreamViewerWrapper>
//       <StreamVideo ref={videoRef} poster={poster} />
//     </StreamViewerWrapper>
//   )
// };

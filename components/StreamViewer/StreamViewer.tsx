import React, { useEffect } from "react";
import { useRouter } from "next/router";

import {
  StreamViewerWrapper,
  StreamVideo,
  StreamHeaderFade
} from "./StreamViewer.styles";

export const StreamViewer = ({ props }: any) => {
  const router = useRouter();
  const { streamId } = router.query;

  const playerRef = React.useRef(null);

  const videoJsOptions = streamId
    ? {
        // lookup the options in the docs for more options
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
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

    // you can handle player events here
    player.on("waiting", () => {
      console.log("player is waiting");
    });

    player.on("dispose", () => {
      console.log("player will dispose");
    });
  };

  // const changePlayerOptions = () => {
  //   // you can update the player through the Video.js player instance
  //   if (!playerRef.current) {
  //     return;
  //   }
  //   // [update player through instance's api]
  //   playerRef.current.src([{src: 'http://ex.com/video.mp4', type: 'video/mp4'}]);
  //   playerRef.current.autoplay(false);
  // };

  useEffect(() => {
    console.log(streamId);
  }, []);

  return (
    <StreamViewerWrapper>
      <StreamVideo options={videoJsOptions} onReady={handlePlayerReady} />
      <StreamHeaderFade />
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

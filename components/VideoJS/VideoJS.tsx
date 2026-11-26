import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoJSProps {
  options: any;
  onReady?: (player: any) => void;
  /** Accessible name for the player region; video.js defaults to "Video Player". */
  label?: string;
}

export const VideoJS = ({ options, onReady, label }: VideoJSProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const player = (playerRef.current = videojs(videoElement, options, () => {
        console.log("player is ready");
        onReady && onReady(player);
      }));
    } else {
      // you can update player here [update player through props]
      // const player = playerRef.current;
      // player.autoplay(options.autoplay);
      // player.src(options.sources);
    }
  }, [options, videoRef]);

  // video.js renders the player as role="region" named "Video Player"; name it after the
  // content when the caller knows it.
  useEffect(() => {
    const player = playerRef.current;
    if (player && label) {
      player.el()?.setAttribute("aria-label", label);
    }
  }, [label, options]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      {/* video.js adds the caption tracks from the player options. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        playsInline
      />
    </div>
  );
};

export default VideoJS;

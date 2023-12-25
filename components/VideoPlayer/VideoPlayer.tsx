import { useTheme } from '@emotion/react';
import React, { useState, useEffect, useRef } from 'react';

import {
  MainVid,
  VideoHover,
  VideoContainer,
  VideoFrame,
  VideoControls,
  LeftControls,
  RightControls,
  Progress,
  ProgressBar,
  Elapsed,
  Mute,
  CurrentTime,
  Duration,
  Fullscreen,
  VidInfo
} from './VideoPlayer.styles';

export const VideoPlayer = ({ videoData }) => {
  const theme = useTheme();
  const [player, setPlayer] = useState(null);
  const [isMute, setIsMute] = useState(false);
  const [playerState, setPlayerState] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoFrameRef = useRef(null);
  const progressBarRef = useRef(null);
  const elapsedRef = useRef(null);

  useEffect(() => {
    if (videoData) {
      console.log("VIDEO: ", videoData);
    }

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        const newPlayer = new window.YT.Player(videoFrameRef.current, {
          videoId: videoData?.id,
          events: {
            onReady: () => {
              setPlayer(newPlayer);
            },
            // Other event handlers...
          },
        });
      }
    };

    if (theme.mediaProvider === 'YouTube' && videoData) {
      const onYouTubeIframeAPIReady = () => {
        const newPlayer = new YT.Player('videoFrame', {
          videoId: videoData?.id,
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
        setPlayer(newPlayer);
      };

      window['onYouTubeIframeAPIReady'] = onYouTubeIframeAPIReady;

      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      return () => {
        if (firstScriptTag.parentNode) {
          firstScriptTag.parentNode.removeChild(tag);
        }
      };
    }
  }, [videoData, theme.mediaProvider]);

  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        if (typeof player.getCurrentTime === 'function') {
          setCurrentTime(player.getCurrentTime());
          setDuration(player.getDuration());
        }
      }, 1000);
  
      return () => clearInterval(interval);
    }
  }, [player]);

  const onPlayerReady = (event) => {
    // Player is ready
    const player = event.target;
    player.playVideo();
    player.mute();
  };

  //   const onPlayerStateChange = (event) => {
  //     // Player state has changed

  //     // event.data can be any of the following:
  //     // -1 (unstarted)
  //     // 0 (ended)
  //     // 1 (playing)
  //     // 2 (paused)
  //     // 3 (buffering)
  //     // 5 (video cued).

  //     switch (event.data) {
  //       case -1:
  //         // Video has not started
  //         console.log('Video has not started');
  //         break;
  //       case 1:
  //         console.log('Video has started playing');
  //         // Video has started playing
  //         break;
  //       case 2:
  //         console.log('Video has been paused');
  //         // Video has been paused
  //         break;
  //       case 3:
  //         console.log('Video is buffering');
  //         // Video is buffering
  //         break;
  //       case 5:
  //         // Video is cued
  //         console.log('Video is cued');
  //         break;
  //     }
  //   };

  const toggleMute = () => {
    setIsMute(!isMute);
  };

  const renderMuteIcon = () => {
    return isMute ? <i className="fa fa-volume-off"></i> : <i className="fa fa-volume-up"></i>;
  };

  const _toggleMute = () => {
    if (player.isMuted()) {
      player.unMute();
      setIsMute(false);
    } else {
      player.mute();
      setIsMute(true);
    }
  };

  const _renderMute = () => {
    if (!isMute) {
      return (
        <i className="fa fa-volume-up"></i>
      );
    } else {
      return (
        <i className="fa fa-volume-off"></i>
      );
    }
  };

  const mobilePlayer = () => {
    // if mobile device
    if (window.innerWidth < 768) {
      return (
        <div id="videoFrame"></div>
      );
    }
  };

  const onPlayerStateChange = (event) => {
    setPlayerState(event.data);
    if (event.data === YT.PlayerState.PLAYING) {
      videoFrameRef.current.style.opacity = '1';
    }
    if (event.data === YT.PlayerState.ENDED) {
      videoFrameRef.current.style.opacity = '0';
    }
  };

  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        setCurrentTime(player.getCurrentTime());
        setDuration(player.getDuration());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [player]);

  const formatTime = (time) => {
    time = Math.round(time);
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  useEffect(() => {
    if (progressBarRef.current && player) {
      progressBarRef.current.value = (currentTime / duration) * 100;
    }
    if (elapsedRef.current && player) {
      elapsedRef.current.style.width = `${(currentTime / duration) * 100}%`;
    }
  }, [currentTime, duration, player]);

  const playFullscreen = () => {
    // Fullscreen logic here
  };

  return (
    <MainVid>
      <VideoFrame id="videoFrame" ref={videoFrameRef}></VideoFrame>
      <VideoControls id="videoControls">
        <ProgressBar type="range" id="progressBar" ref={progressBarRef} />
        <Elapsed id="elapsed" ref={elapsedRef}></Elapsed>
        <LeftControls>
          <Mute id="mute" className="pull-left" onClick={_toggleMute}>{_renderMute()}</Mute>
          <CurrentTime id="currentTime">{formatTime(currentTime)}</CurrentTime>
        </LeftControls>
        <RightControls>
          <Fullscreen id="fullscreen" onClick={playFullscreen}><i className="fa fa-expand"></i></Fullscreen>
          <Duration id="duration">{formatTime(duration)}</Duration>
        </RightControls>
      </VideoControls>
    </MainVid>
  );
};
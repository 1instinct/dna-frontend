import Image from "next/image";
import React, { useState } from "react";
import InputRange from "react-input-range";
import "react-input-range/lib/css/index.css";
import "react-rangeslider/lib/index.css";
import ReactPlayer from "react-player/youtube";
import styled from "@emotion/styled";
import { VideoContainer } from "./Video.styles";

interface Props {
  isPlaying: any;
  mute: boolean;
  mutedPlayer: any;
  handleChangeReverse: any;
  reverse: any;
}
interface S {
  player: string;
  playVideo: any;
  value: any;
  reverseValue: any;
}
export const Video = (props: any) => {
  const { isPlaying } = props;
  const [player, setPlayer] = useState(null);
  const [playVideo, setPlayVideo] = useState("");
  const [value, setValue] = useState(100);
  const [reverseValue, setReverseValue] = useState(3);

  const _onReady = (event: any) => {
    event.target.pauseVideo();
  };
  const _onPlayerReady = (event: any) => {
    var embedCode = event.target.getVideoEmbedCode();
    event.target.playVideo();
    const embedElement = document.getElementById("embed-code");
    if (embedElement) {
      embedElement.innerHTML = embedCode;
    }
  };

  const opts = {
    height: "250",
    width: "310",
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
      autohide: 1,
      showinfo: 0,
      modestbranding: 1,
      playsinline: 1,
      enablejsapi: 1,
      wmode: "opaque",
      loop: 1,
      origin: "http://localhost:3000"
    }
  };

  return (
    <>
      <VideoContainer>
        {isPlaying && (
          <ReactPlayer
            url="https://www.youtube.com/embed/SMvT5sAk4g8"
            muted={true}
            playing={isPlaying}
          />
        )}
        {/* {
            this.props.mute ? (
              <div style={{ marginLeft: -50, marginTop: 10, cursor: 'pointer' }}>
                <Image
                  src="/img/mute.png"
                  alt="Picture of the author"
                  width={16}
                  height={16}
                  onClick={this.props.mutedPlayer}
                />
              </div>
            ) : (
                <div style={{ marginLeft: -50, marginTop: 10, cursor: 'pointer' }}>
                  <Image
                    src="/img/volume-off.png"
                    alt="Picture of the author"
                    width={16}
                    height={16}
                    onClick={this.props.mutedPlayer}
                  />
                </div>
              )
          } */}
        {/* <div className='slider-horizontal'
            style={{ marginTop: -20, marginLeft: 0, width: 200 }}>
            <InputRange
              maxValue={100}
              minValue={0}
              value={this.state.value}
              allowSameValues={false}
              onChange={value => this.setState({ value },
                () => this.props.handleChangeReverse(value))} />
          </div> */}
      </VideoContainer>
    </>
  );
};

import React, { useRef, useState, useEffect } from "react";
import ReactAudioPlayer from "react-audio-player";
import { useTracks } from "../../hooks/useTracks";
import Image from "next/image";
import { Video } from "../Video";
import SoundCloudPlayer from "react-player/soundcloud";

const user_id = process.env.SC_USER_ID;
const client_id = process.env.SC_CLIENT_ID;
const client_secret = process.env.SC_CLIENT_SECRET;

import {
  StarsContainer,
  Stars,
  GlowContainer,
  Glow,
  Skyline,
  Cockpit
} from "./MediaPlayer.styles";
import { NotifyForm } from "..";

const styles = {
  backgroundColor: "#1f1f1f",
  paddingLeft: "17px",
  paddingRight: "15px"
};

interface Props {}

export interface S {
  songs: any;
  index: any;
  isPlaying: boolean;
  url: any;
  currentTime: any;
  duration: any;
  muted: boolean;
  volume: number;
  reverse: any;
  seeking: boolean;
  seekable: any;
  audioInput: any;
  seekbarvalue: any;
}

export interface Song {
  title: string;
  permalink_url: string;
  stream_url: string;
}

// export const MediaPlayer = (props: any): <Props, S> => {
export const MediaPlayer = (props: any) => {
  //seekbarFunction: (e: Event) => void;
  const rap = useRef<any>();
  const isClient = typeof window !== "undefined";
  const [songs, setSongs] = useState<Song[]>([]);
  const [songData, setSongData] = useState<any | null>(null);
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [url, setUrl] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [duration, setDuration] = useState("");
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [reverse, setReverse] = useState(100);
  const [seeking, setSeeking] = useState(false);
  const [seekable, setSeekable] = useState("");
  const [audioInput, setAudioInput] = useState<Element | null>(null);
  const [seekbarvalue, setSeekbarvalue] = useState("");

  const sampleSoundCloudURLs = [
    "https://soundcloud.com/smokeyyy/sets/sky-chase-watermark",
    "https://soundcloud.com/smokeyyy/dreams",
    "https://soundcloud.com/smokeyyy/paradise"
  ];

  const spotifyEmbedCode = `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/album/3FfuBJ7SkThWE5ZsxM8DZx?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;

  const handleChangeReverse = (value: any) => {
    const finalValue = (value * 1) / 100;
    if (finalValue) {
      setVolume(finalValue);
    }
  };

  const mutedPlayer = () => {
    if (muted == true) {
      setMuted(false);
    } else {
      setMuted(true);
    }
  };
  const _playCurrentSong = () => {
    // rap.audioEl.current.play();
    setIsPlaying(true);
  };

  const _pauseAudio = () => {
    // rap.audioEl.current.pause();
    setIsPlaying(false);
  };

  const getRandomIndex = () => {
    return Math.floor(Math.random() * songs.length);
  };

  const _playNextSong = () => {
    if (songs && songs.length != undefined && songs.length != 0) {
      let randomIndex = getRandomIndex();

      if (randomIndex != songIndex) {
        setSongIndex(randomIndex);
      } else {
        _playNextSong();
      }
    }
  };

  const _ErrorNextSong = (e: any) => {
    console.log(
      `${
        songs[songIndex] && songs[songIndex].title
      } can't be loaded \nAutomatically loading next song...`
    );
    _playNextSong();
  };

  const _renderSongPlayer = () => {
    // if (isLoading) {
    //   return <h1>Loading...</h1>;
    // }

    // if (error) {
    //   return <h1>Error {status}</h1>;
    // }
    return (
      <>
        <a
          href={
            songs[songIndex] && songs[songIndex].permalink_url
              ? songs[songIndex] && songs[songIndex].permalink_url
              : ""
          }
          target="blank"
        >
          <p
            style={{
              color: "#fff",
              width: "100%",
              bottom: "8%",
              textAlign: "center",
              position: "absolute",
              fontFamily: "james",
              fontSize: 40,
              margin: "auto",
              zIndex: 99999
            }}
          >
            {songs[songIndex] && songs[songIndex].title}
          </p>
        </a>
        <div
          style={{
            position: "absolute",
            width: "100%",
            margin: "auto",
            zIndex: 99999,
            display: "flex",
            justifyContent: "center",
            color: "red",
            bottom: 5
          }}
        >
          <div style={{ marginTop: 10, cursor: "pointer", marginRight: 5 }}>
            <Image
              src="/img/previous.png"
              alt="Picture of the author"
              width={24}
              height={24}
              onClick={_playNextSong}
            />
          </div>
          {isPlaying ? (
            <div style={{ cursor: "pointer", marginTop: 10 }}>
              <Image
                src="/img/pause.png"
                alt="Picture of the author"
                width={24}
                height={24}
                onClick={_pauseAudio}
              />
            </div>
          ) : (
            <div style={{ cursor: "pointer", marginTop: 10 }}>
              <Image
                src="/img/play-arrow.png"
                alt="Picture of the author"
                width={24}
                height={24}
                onClick={_playCurrentSong}
              />
            </div>
          )}
          {sampleSoundCloudURLs.length > 0 && (
            <SoundCloudPlayer
              url={sampleSoundCloudURLs[songIndex]}
              playing={isPlaying}
              volume={volume}
              muted={muted}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleNext}
              onVolume={handleVolumeChange}
            />
          )}
          <div style={{ marginTop: 10, cursor: "pointer", marginLeft: 5 }}>
            <Image
              src="/img/right-arrow.png"
              alt="Picture of the author"
              width={24}
              height={24}
              onClick={_playNextSong}
            />
          </div>
        </div>
      </>
    );
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    setSongIndex((prevIndex) => (prevIndex + 1) % sampleSoundCloudURLs.length);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
  };

  const handleToggleMute = () => {
    setMuted((prevMuted) => !prevMuted);
  };

  // useEffect(() => {
  //   if (isClient) {
  //     const {
  //       error,
  //       status,
  //       data: fetchedSongData,
  //       isLoading,
  //       isSuccess
  //     }: {
  //       error: any;
  //       status: any;
  //       data: any;
  //       isLoading: boolean;
  //       isSuccess: boolean;
  //     } = useTracks("smokeyyy");

  //     setSongData(fetchedSongData);
  //   }
  //   const audio = document.getElementsByClassName("react-audio-player")[0];
  //   // console.log( this.rap.audioEl.current);
  //   //audio.addEventListener('timeupdate', this.UpdateTheTime, false);
  //   // audio.addEventListener('durationchange', this.SetSeekBar, false);
  //   // const seekbar = document.getElementById('seekbar');
  //   // this.setState({ seekbarvalue: seekbar })
  //   setAudioInput(audio);
  //   const { current } = rap;
  //   // if (rap && rap.audioEl && rap.audioEl.current) {
  //   if (current) {
  //     current.onvolumechange = (e: any) => {
  //       console.log(`Events**********`, e);
  //     };
  //   }
  //   //this.setState({ audioInput: this.rap });
  //   // document.addEventListener("keypress", (e) => {
  //   //   console.log("KEYPRESSED*************", e)
  //   //   if (e.key === " ") {
  //   //     if (isPlaying) {
  //   //       this._pauseAudio();
  //   //     } else {
  //   //       this._playCurrentSong();
  //   //     }
  //   //   }
  //   // });

  //   /* Update state songs while data is passed from parent component while ready and formated */
  //   // setSongs(props.songs);
  // }, [isClient, songs, rap, props.songs]);

  const loadSongs = async () => {
    console.log("Starting API call");

    const userTracks = await useTracks("smokeyyy");
    // const userTracks = await sc.playlists.getV2("smokeyyy");
    // const userTracks = await fetch("/api/corsProxy").then((res: any) => {
    //   console.log("res: ", res);
    //   return res;
    // }).catch((err: any) => { throw Error(err) });
    // const userTracks = await fetch("/api/corsProxy");
    // const trackData = userTracks.json();
    console.log("Tracks: ", userTracks, songData);
    // setSongs(userTracks);
    // return userTracks;
    // SC.initialize({
    //   client_id: `${process.env.SC_CLIENT_ID}`,
    //   redirect_uri: 'https://smokey.fm/player'
    // });
    // SC.get('/user/6319082/tracks')
    //   .then(tracks => {
    //     console.log('Latest tracks: ', tracks);
    //     return tracks.json();
    //   })
    //   .then(result => {
    //     this.setState({ songs: result[0].tracks }, () => this.GetUrl());
    //   },
    //   (error) => {}
    // );
    // fetch(
    //   `https://api.soundcloud.com/users/${user_id}/playlists?client_id=${client_id}`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "Content-type": "application/json;charset=UTF-8",
    //       "Authorization": `OAuth ${client_secret}`
    //     }
    //   }
    // )
    // fetch(
    //   "https://api.soundcloud.com/users/6319082/playlists?client_id=" +
    //     `${client_id}`
    // )
    //   .then((res) => res.json())
    //   .then(
    //     (result) => {
    //       this.setState({ songs: result[0].tracks }, () => this.GetUrl());
    //     },
    //     (error) => {}
    //   );
    return userTracks;
  };

  // const GetCurrentTimeAndDuration = () => {
  //   const { current } = rap;
  //   // setCurrentTime(rap.audioEl.current.currentTime);
  //   // setDuration(rap.audioEl.current.duration);
  //   // setDuration(rap.audioEl.current.seeking);
  //   // setDuration(rap.audioEl.current.seekable);
  // };

  // const randomArrayShuffle = (array: any) => {
  //   var currentIndex = array.length,
  //     temporaryValue,
  //     randomIndex;
  //   while (0 !== currentIndex) {
  //     randomIndex = Math.floor(Math.random() * currentIndex);
  //     currentIndex -= 1;
  //     temporaryValue = array[currentIndex];
  //     array[currentIndex] = array[randomIndex];
  //     array[randomIndex] = temporaryValue;
  //   }
  //   return array;
  // };

  // const GetUrl = () => {
  //   randomArrayShuffle(songs);

  //   const songUrl = songs.map((song: any) => {
  //     return song.stream_url + "?client_id=" + `${client_id}`;
  //   });
  //   setUrl(songUrl);
  //   //this.GetCurrentTimeAndDuration()
  // };

  // UpdateTheTime = () => {
  // 	var sec = audioInput.currentTime;
  // 	var h = Math.floor(sec / 3600);
  // 	sec = sec % 3600;
  // 	var min = Math.floor(sec / 60);
  // 	sec = Math.floor(sec % 60);
  // 	if (sec.toString().length < 2) sec = "0" + sec;
  // 	if (min.toString().length < 2) min = 0 + min;
  // 	document.getElementById('lblTime').innerHTML = h + ":" + min + ":" + sec;
  // 	seekbarvalue.min = audioInput.startTime;
  // 	seekbarvalue.max = audioInput.duration;
  // 	seekbarvalue.value = audioInput.currentTime;
  // }
  
  // SetSeekBar = () => {
  // 	seekbarvalue.min = 0;
  // 	seekbarvalue.max = audioInput.duration;
  // }

  useEffect(() => {
    setSongIndex(0);
  }, []);

  return (
    <>
      {/* <div style={{
        color: '#fff', width: '100%', bottom: '12%',
        textAlign: 'center',
        position: 'absolute',
        margin: 'auto', zIndex: 999
      }}>
        <input type="range" step="any" id="seekbar"
          onChange={ChangeTheTime} />
        <label id="lblTime">-:--:--</label>
      </div> */}
      <GlowContainer>
        <Glow />
      </GlowContainer>
      <StarsContainer>
        <Stars />
      </StarsContainer>
      <Skyline />
      <Cockpit />
      <Video
        isPlaying={isPlaying}
        mute={muted}
        mutedPlayer={mutedPlayer}
        handleChangeReverse={handleChangeReverse}
        reverse={reverse}
      />
      {songs && _renderSongPlayer()}
      {/* <div dangerouslySetInnerHTML={{__html: spotifyEmbedCode}} /> */}
      <NotifyForm />
    </>
  );
};

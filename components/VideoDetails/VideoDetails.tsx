import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Head from 'next/head';
import moment from 'moment';
import { fetchVideo } from '../../hooks';

// Styled components
const HorizontalList = styled.div`
  // Your styles here
`;

export const VideoDetails: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const { id } = router.query;
  const [isMute, setIsMute] = useState(false);
  const [player, setPlayer] = useState(null);
  const { data: videoData, isLoading } = useQuery(['videoData', id], () => fetchVideo(id as string));

  useEffect(() => {
    if (theme.mediaProvider === 'YouTube' && videoData) {
      const onYouTubeIframeAPIReady = () => {
        const newPlayer = new YT.Player('videoFrame', {
          videoId: videoData?.id, // The YouTube video ID
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
        setPlayer(newPlayer);
      };

      window['onYouTubeIframeAPIReady'] = onYouTubeIframeAPIReady;

      // Insert the YouTube IFrame Player API script tag
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      return () => {
        // Clean up the script tag
        if (firstScriptTag.parentNode) {
          firstScriptTag.parentNode.removeChild(tag);
        }
      };
    }
  }, [videoData, theme.mediaProvider]);

  const onPlayerReady = (event) => {
    // Player is ready
    const player = event.target;
    player.playVideo();
    player.mute();
  };

  const onPlayerStateChange = (event) => {
    // Player state has changed

    // event.data can be any of the following:
    // -1 (unstarted)
    // 0 (ended)
    // 1 (playing)
    // 2 (paused)
    // 3 (buffering)
    // 5 (video cued).

    switch (event.data) {
      case -1:
        // Video has not started
        console.log('Video has not started');
        break;
      case 1:
        console.log('Video has started playing');
        // Video has started playing
        break;
      case 2:
        console.log('Video has been paused');
        // Video has been paused
        break;
      case 3:
        console.log('Video is buffering');
        // Video is buffering
        break;
      case 5:
        // Video is cued
        console.log('Video is cued');
        break;
    }
  };

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

  const renderVids = () => {
    return allVids.map((vid) => {
      return <VidSnippet key={vid.id} vid={vid} />;
    });
  };

  // const getRelated = () => {
  //     let related = Vids.find({
  //         "title": {$nin: ["Private video", "Deleted video"]},
  //         "listId":videoData?.listId
  //     }, {
  //         sort: {
  //             date: -1
  //         }
  //     }).fetch();
  //     return related.map((vid) => {
  //         return <VidSnippet key={vid.id} vid={vid} />;
  //     });
  // },

  const formatDate = () => {
    let videoDate = videoData?.date;
    return moment(videoDate).fromNow();
  };

  const facebookShare = () => {
    window.open('https://www.facebook.com/sharer/sharer.php?u=http://tv.galoremag.com/video/' + videoData?.slug, 'Share this post on Facebook', 'width=600,height=400');
  };

  const twitterShare = () => {
    window.open('https://twitter.com/share?url=http://tv.galoremag.com/video/' + videoData?.slug, 'Tweet this post', 'width=600,height=400');
  };

  const mobilePlayer = () => {
    // if mobile device
    if (window.innerWidth < 768) {
      return (
        <div id="videoFrame"></div>
      );
    }
  };

  let title = videoData?.title,
      cleanTitle = title?.replace(" | Galore TV","");

  return (
    <div>
      <Head>
        <title>{videoData?.title} 💅🏾 GaloreTV</title>
        <meta name="description" content={videoData?.desc} />
        {/* Other meta tags */}
      </Head>

      <div id="contentContainer" className="container-fluid noPadding" itemType="http://schema.org/Episode">

        <div id="mainVid" className="col-sm-12 col-lg-12 col-lg-offset-0 noPadding">
          <div id="videoContainer" className="col-sm-8 noPadding">
            {mobilePlayer()}
            <div id="videoFrame"></div>
            <div id="videoControls">
              <div id="mute" className="pull-left" onClick={_toggleMute}>{_renderMute()}</div>
              <div id="currentTime" className="pull-left"></div>
              <div id="progress" className="pull-left">
                <div id="elapsed" className="pull-left"></div>
                <input type="range" id="progressBar"></input>
              </div>

              <div id="fullscreen"><i className="fa fa-expand"></i></div>
              <div id="duration"></div>
            </div>
          </div>

          <div id="vidInfo" className="col-sm-4">
            <div id="vidShare">
              <ul id="shareButtons" className="list-inline text-center">
                <li><a className="share-facebook" href="javascript:;" target="popup" onClick={facebookShare} title="Share on Facebook"><i className="fa fa-facebook"></i></a></li>
                <li><a className="share-twitter" href="javascript:;" target="popup" onClick={twitterShare} title="Share on Twitter"><i className="fa fa-twitter"></i></a></li>
                <li><a href="mailto:friend@galoremag.com?subject=UGGHHH%3A%20FIRE.%20Seen%20on%20GaloreTV&amp;body=Whoa, %20check%20this%20amazing%20video%20out%20on%20GaloreTV" title="Share with an Email"><i className="fa fa-envelope"></i></a></li>
              </ul>
            </div>

            <hr></hr>

            <h3 itemProp="name">{cleanTitle}</h3>
            <h5 itemProp="dateCreated">{formatDate()}</h5>
            <p itemProp="description">{videoData?.desc}</p>

            <hr></hr>

            <p>You are watching:</p>
            <h4 itemProp="show"><a href={""} title={show?.title}><span className="badge">{show?.title}</span></a></h4>
          </div>
        </div>

        <div id="mainContent" className="col-sm-12 col-lg-12 col-lg-offset-0">

          <h3>
            <a href={""}><flag>More Episodes <i className="fa fa-angle-right"></i></flag></a>
          </h3>
          <div className="horizontalList">

            <a href={""} title={show?.title} className="snippet last">
              <div className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </div>
              <h5>See More</h5>
            </a>

          </div>

          <h3><flag>Everything Else</flag></h3>
          <div className="horizontalList">
            {renderVids()}

            <a href="/browse/all" className="snippet last">
              <div className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </div>
              <h5>See More</h5>
            </a>

          </div>

          <div>
            <Footer />
          </div>

        </div>

      </div>
      <HorizontalList>
        {/* Your list items here */}
      </HorizontalList>
    </div>
  );
};

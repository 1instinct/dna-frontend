import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QueryKeys, useShows, useVideo, useVideos } from "../../hooks";
import { fetchVideo, fetchVideos, fetchShows } from "../../hooks";
import Head from "next/head";
import moment from "moment";
import { VideoSnippet } from "../VideoSnippet";
import { IShow, IVideo } from "../../typings";
import { Footer, VideoPlayer } from "..";
import footerData from "../../data/footer.json";
import { QueryClient, dehydrate } from "react-query";

import { Content, HorizontalList, SeeMoreLink } from "../Layout/Layout.styles";

import {
  MainVid,
  VideoContainer,
  VidInfo,
  ShareButtons
} from "./VideoDetails.styles";

export const VideoDetails = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { id } = router.query;
  const videoId = id as string;

  const [videoShow, setVideoShow] = useState<IShow | null>(null);

  const {
    data: videoData,
    isLoading: videoLoading,
    error: videoError
  } = useVideo(videoId);
  const {
    data: allVids,
    isLoading: allVidsLoading,
    error: allVidsError
  } = useVideos("latest");

  const renderVids = () => {
    return allVids?.map((video: IVideo) => {
      return <VideoSnippet key={video.id} video={video} />;
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
    window.open(
      "https://www.facebook.com/sharer/sharer.php?u=http://tv.galoremag.com/video/" +
        videoData?.slug,
      "Share this post on Facebook",
      "width=600,height=400"
    );
  };

  const twitterShare = () => {
    window.open(
      "https://twitter.com/share?url=http://tv.galoremag.com/video/" +
        videoData?.slug,
      "Tweet this post",
      "width=600,height=400"
    );
  };

  let title = videoData?.title,
    cleanTitle = title?.replace(" | Galore TV", "");

  return (
    <div>
      <Head>
        <title>{cleanTitle} 💅🏾 GaloreTV</title>
        <meta name="description" content={videoData?.desc} />
        {/* Other meta tags */}
      </Head>

      <div
        id="contentContainer"
        className="container-fluid noPadding"
        itemType="http://schema.org/Episode"
      >
        <MainVid
          id="mainVid"
          className="col-sm-12 col-lg-12 col-lg-offset-0 noPadding"
        >
          <VideoContainer id="videoContainer" className="col-sm-8 noPadding">
            <VideoPlayer videoData={videoData} />
          </VideoContainer>

          <VidInfo id="vidInfo" className="col-sm-4">
            <div id="vidShare">
              <ShareButtons id="shareButtons">
                <a
                  className="share-facebook"
                  href="#"
                  target="popup"
                  onClick={facebookShare}
                  title="Share on Facebook"
                >
                  <i className="fa fa-facebook"></i>
                </a>
                <a
                  className="share-twitter"
                  href="#"
                  target="popup"
                  onClick={twitterShare}
                  title="Share on Twitter"
                >
                  <i className="fa fa-twitter"></i>
                </a>
                <a
                  href="mailto:friend@galoremag.com?subject=UGGHHH%3A%20FIRE.%20Seen%20on%20GaloreTV&amp;body=Whoa, %20check%20this%20amazing%20video%20out%20on%20GaloreTV"
                  title="Share with an Email"
                >
                  <i className="fa fa-envelope"></i>
                </a>
              </ShareButtons>
            </div>

            <hr></hr>

            <h3 itemProp="name">{cleanTitle}</h3>
            <h5 itemProp="dateCreated">{formatDate()}</h5>
            <p itemProp="description">{videoData?.desc}</p>

            <hr></hr>

            <p>You are watching:</p>
            <h4 itemProp="show">
              <a href={""} title={videoShow?.title}>
                <span className="badge">{videoShow?.title}</span>
              </a>
            </h4>
          </VidInfo>
        </MainVid>

        <Content id="mainContent">
          <h3>
            <a href={""}>
              <span>
                More Episodes <i className="fa fa-angle-right"></i>
              </span>
            </a>
          </h3>
          <HorizontalList className="horizontalList">
            <SeeMoreLink
              href={""}
              title={videoShow?.title}
              className="snippet last"
            >
              <div className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </div>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>

          <h3>
            <span>Everything Else</span>
          </h3>
          <HorizontalList className="horizontalList">
            {renderVids()}

            <SeeMoreLink href="/browse/all" className="snippet last">
              <div className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </div>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>

          <div>
            <Footer footerData={footerData} />
          </div>
        </Content>
      </div>
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const queryClient = new QueryClient();
  const { slug } = context.params;
  const videoId = context.query.id;
  console.log("SLUG: ", slug);
  console.log("ID: ", videoId);

  if (videoId) {
    await queryClient.prefetchQuery([QueryKeys.VIDEO, videoId], () =>
      fetchVideo(videoId)
    );
  }
  await queryClient.prefetchQuery([QueryKeys.VIDEO, "latest"], () =>
    fetchVideos("latest")
  );
  await queryClient.prefetchQuery([QueryKeys.SHOWS], () => fetchShows());

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

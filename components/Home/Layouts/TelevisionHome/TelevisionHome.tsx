// Layouts/TelevisionHome.tsx
import React from "react";
import { QueryClient, dehydrate } from "react-query";
import {
  fetchVideos,
  fetchShows,
  useVideos
} from "../../../../hooks/useVideos";
import { VideoSnippet } from "../../../VideoSnippet";
// import { PostSnippet } from '../../../PostSnippet';
import { VideoSlider } from "../../../VideoSlider";

import { HorizontalList, SeeMoreLink } from "../../../Layout/Layout.styles";

import footerData from "../../../../data/footer.json";

import {
  Wrapper,
  HeroContainer,
  MainContent,
  ListTitle,
  SeeMoreIconWrapper
} from "./TelevisionHome.styles";

import { QueryKeys } from "../../../../hooks/queryKeys";
import { Footer, Loading, LoadingWrapper } from "../../..";

import { IVideo, IFeaturedVideo } from "../../../../typings";

export const TelevisionHome: React.FC<any> = ({ wholesale }) => {
  const {
    data: latestData,
    isLoading: latestVideosLoading,
    isError: isLatestVideosError
  } = useVideos("latest");
  const {
    data: beautyConfessionalData,
    isLoading: beautyConfessionalLoading,
    isError: isBeautyConfessionalError
  } = useVideos("beautyConfessional");
  const {
    data: bombshellOnStreetData,
    isLoading: bombshellOnStreetLoading,
    isError: isBombshellOnStreetError
  } = useVideos("bombshellOnStreet");
  const {
    data: exclusivesData,
    isLoading: exclusivesLoading,
    isError: isExclusivesError
  } = useVideos("exclusives");
  const {
    data: featuredData,
    isLoading: featuredLoading,
    isError: isFeaturedError
  } = useVideos("featured");
  const {
    data: girlsData,
    isLoading: girlsLoading,
    isError: isGirlsError
  } = useVideos("girls");
  const {
    data: liveFromData,
    isLoading: liveFromLoading,
    isError: isLiveFromError
  } = useVideos("liveFrom");
  const {
    data: model20Data,
    isLoading: model20Loading,
    isError: isModel20Error
  } = useVideos("model20");
  const {
    data: originalsData,
    isLoading: originalsLoading,
    isError: isOriginalsError
  } = useVideos("originals");
  const {
    data: originalsTwoData,
    isLoading: originalsTwoLoading,
    isError: isOriginalsTwoError
  } = useVideos("originalsTwo");
  const {
    data: specialsData,
    isLoading: specialsLoading,
    isError: isSpecialsError
  } = useVideos("specials");
  const {
    data: teachMeData,
    isLoading: teachMeLoading,
    isError: isTeachMeError
  } = useVideos("teachMe");
  const {
    data: uncoveredData,
    isLoading: uncoveredLoading,
    isError: isUncoveredError
  } = useVideos("uncovered");
  const {
    data: vintage1Data,
    isLoading: vintage1Loading,
    isError: isVintage1Error
  } = useVideos("vintage/1");
  const {
    data: vintage2Data,
    isLoading: vintage2Loading,
    isError: isVintage2Error
  } = useVideos("vintage/2");
  const {
    data: vintage3Data,
    isLoading: vintage3Loading,
    isError: isVintage3Error
  } = useVideos("vintage/3");
  const {
    data: vintage4Data,
    isLoading: vintage4Loading,
    isError: isVintage4Error
  } = useVideos("vintage/4");
  const {
    data: vintage5Data,
    isLoading: vintage5Loading,
    isError: isVintage5Error
  } = useVideos("vintage/5");

  const posts = [];

  const isLoading =
    beautyConfessionalLoading ||
    bombshellOnStreetLoading ||
    exclusivesLoading ||
    featuredLoading ||
    girlsLoading ||
    liveFromLoading ||
    model20Loading ||
    originalsLoading ||
    specialsLoading ||
    teachMeLoading ||
    uncoveredLoading ||
    vintage1Loading ||
    vintage2Loading ||
    vintage3Loading ||
    vintage4Loading ||
    vintage5Loading;
  const isError =
    isBeautyConfessionalError ||
    isBombshellOnStreetError ||
    isExclusivesError ||
    isFeaturedError ||
    isGirlsError ||
    isLiveFromError ||
    isModel20Error ||
    isOriginalsError ||
    isSpecialsError ||
    isTeachMeError ||
    isUncoveredError ||
    isVintage1Error ||
    isVintage2Error ||
    isVintage3Error ||
    isVintage4Error ||
    isVintage5Error;

  const renderLatest = () => {
    if (isLoading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else {
      return latestData.slice(0, 5).map((video: IVideo) => {
        return <VideoSnippet key={video.url} video={video} />;
      });
    }
  };

  const renderExclusives = () => {
    if (isLoading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else {
      return exclusivesData.slice(0, 5).map((video: IVideo) => {
        return <VideoSnippet key={video.url} video={video} />;
      });
    }
  };

  const renderOriginals = () => {
    if (isLoading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else {
      return originalsData.slice(0, 5).map((video: IVideo) => {
        return <VideoSnippet key={video.url} video={video} />;
      });
    }
  };

  const renderBeautyConfessionals = () => {
    if (isLoading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else {
      return beautyConfessionalData.slice(0, 5).map((video: IVideo) => {
        return <VideoSnippet key={video.url} video={video} />;
      });
    }
  };

  const renderGirls = () => {
    if (isLoading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else {
      return girlsData.slice(0, 5).map((video: IVideo) => {
        return <VideoSnippet key={video.url} video={video} />;
      });
    }
  };

  const renderLiveFrom = () => {
    if (isLoading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else {
      return liveFromData.slice(0, 5).map((video: IVideo) => {
        return <VideoSnippet key={video.url} video={video} />;
      });
    }
  };

  const renderModel20 = () => {
    if (isLoading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else {
      return model20Data.slice(0, 5).map((video: IVideo) => {
        return <VideoSnippet key={video.url} video={video} />;
      });
    }
  };

  const renderSpecials = () => {
    if (isLoading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else {
      return specialsData.slice(0, 5).map((video: IVideo) => {
        return <VideoSnippet key={video.url} video={video} />;
      });
    }
  };

  const renderTeachMe = () => {
    if (isLoading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else if (teachMeData) {
      return teachMeData.slice(0, 5).map((video: IVideo) => {
        return <VideoSnippet key={video.url} video={video} />;
      });
    }
  };

  const renderUncovered = () => {
    if (isLoading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    } else if (uncoveredData) {
      return uncoveredData.slice(0, 5).map((video: IVideo) => {
        return <VideoSnippet key={video.url} video={video} />;
      });
    }
  };

  // const renderPosts = () => {
  //   if (isLoading) {
  //     return (
  //   <LoadingWrapper>
  //     <Loading />
  //   </LoadingWrapper>
  // );
  //   } else {
  //     return posts.map((post) => {
  //       return <PostSnippet key={post._id} post={post} />;
  //     });
  //   }
  // }

  if (isLoading) {
    return (
      <LoadingWrapper>
        <Loading />
      </LoadingWrapper>
    );
  }

  if (isError) {
    return <LoadingWrapper>Error</LoadingWrapper>;
  }

  return (
    <Wrapper>
      <HeroContainer>
        <div id="slider">
          <div id="featuredSlider" className="owl-carousel">
            <VideoSlider videos={featuredData} />
          </div>
        </div>
      </HeroContainer>

      <MainContent className="col-sm-12 col-lg-12 col-lg-offset-0">
        <div className="contentArea">
          <ListTitle>
            <a href="#" onClick={() => false}>
              <h2>
                The Latest <i className="fa fa-angle-right"></i>
              </h2>
            </a>
          </ListTitle>
          <HorizontalList>
            {renderLatest()}

            <SeeMoreLink
              href="#"
              onClick={() => false}
              className="snippet last"
            >
              <SeeMoreIconWrapper className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </SeeMoreIconWrapper>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>
        </div>

        <div className="contentArea">
          <ListTitle>
            <a href={""}>
              <h2>
                Exclusives <i className="fa fa-angle-right"></i>
              </h2>
            </a>
          </ListTitle>
          <HorizontalList>
            {renderExclusives()}

            <SeeMoreLink href={""} className="snippet last">
              <SeeMoreIconWrapper className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </SeeMoreIconWrapper>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>
        </div>

        <div className="featArea">
          <ListTitle>
            <a href={""}>
              <h2>
                Originals <i className="fa fa-angle-right"></i>
              </h2>
            </a>
          </ListTitle>
          <HorizontalList>
            {renderOriginals()}

            <SeeMoreLink href={""} className="snippet last">
              <SeeMoreIconWrapper className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </SeeMoreIconWrapper>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>
        </div>

        <div className="contentArea">
          <ListTitle>
            <a href={""}>
              <h2>
                Beauty Confessional <i className="fa fa-angle-right"></i>
              </h2>
            </a>
          </ListTitle>
          <HorizontalList>
            {renderBeautyConfessionals()}

            <SeeMoreLink href={""} className="snippet last">
              <SeeMoreIconWrapper className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </SeeMoreIconWrapper>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>
        </div>

        <div className="contentArea">
          <ListTitle>
            <a href="#">
              <h2>
                Girls Girls Girls <i className="fa fa-angle-right"></i>
              </h2>
            </a>
          </ListTitle>
          <HorizontalList>
            {renderGirls()}

            <SeeMoreLink href="#" className="snippet last">
              <SeeMoreIconWrapper className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </SeeMoreIconWrapper>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>
        </div>

        <div className="contentArea">
          <ListTitle>
            <a href="#">
              <h2>
                Live From <i className="fa fa-angle-right"></i>
              </h2>
            </a>
          </ListTitle>
          <HorizontalList>
            {renderLiveFrom()}

            <SeeMoreLink href="#" className="snippet last">
              <SeeMoreIconWrapper className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </SeeMoreIconWrapper>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>
        </div>

        <div className="contentArea">
          <ListTitle>
            <a href="#">
              <h2>
                Model 20 <i className="fa fa-angle-right"></i>
              </h2>
            </a>
          </ListTitle>
          <HorizontalList>
            {renderModel20()}

            <SeeMoreLink href="#" className="snippet last">
              <SeeMoreIconWrapper className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </SeeMoreIconWrapper>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>
        </div>

        <div className="contentArea">
          <ListTitle>
            <a href="#">
              <h2>
                Specials <i className="fa fa-angle-right"></i>
              </h2>
            </a>
          </ListTitle>
          <HorizontalList>
            {renderSpecials()}

            <SeeMoreLink href="#" className="snippet last">
              <SeeMoreIconWrapper className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </SeeMoreIconWrapper>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>
        </div>

        <div className="contentArea">
          <ListTitle>
            <a href="#">
              <h2>
                Teach Me <i className="fa fa-angle-right"></i>
              </h2>
            </a>
          </ListTitle>
          <HorizontalList>
            {renderTeachMe()}

            <SeeMoreLink href="#" className="snippet last">
              <SeeMoreIconWrapper className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </SeeMoreIconWrapper>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>
        </div>

        <div className="contentArea">
          <ListTitle>
            <a href="#">
              <h2>
                Uncovered <i className="fa fa-angle-right"></i>
              </h2>
            </a>
          </ListTitle>
          <HorizontalList>
            {renderUncovered()}

            <SeeMoreLink href="#" className="snippet last">
              <div className="seeMore">
                <i className="fa fa-arrow-right"></i>
              </div>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>
        </div>

        {/* <div className="featArea">
          <ListTitle>
            <a href="http://galoremag.com" target="_blank">
              <h2>
                Something to Read? <i className="fa fa-angle-right"></i>
              </h2>
            </a>
          </ListTitle>
          <HorizontalList>
            {renderPosts()}

            <SeeMoreLink
              href="https://galoremag.com"
              target="_blank"
              className="snippet last"
            >
              <div>
                <i className="fa fa-arrow-right"></i>
              </div>
              <h5>See More</h5>
            </SeeMoreLink>
          </HorizontalList>
        </div> */}
        <div>
          <Footer footerData={footerData} />
        </div>
      </MainContent>
    </Wrapper>
  );
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    [QueryKeys.VIDEOS, "latest", 1],
    () => fetchVideos
  );
  await queryClient.prefetchQuery(
    [QueryKeys.VIDEOS, "beautyConfessional", 1],
    () => fetchVideos
  );
  await queryClient.prefetchQuery(
    [QueryKeys.VIDEOS, "bombshellOnStreet", 1],
    () => fetchVideos
  );
  await queryClient.prefetchQuery(
    [QueryKeys.VIDEOS, "etcetera", 1],
    () => fetchVideos
  );
  await queryClient.prefetchQuery(
    [QueryKeys.VIDEOS, "exclusives", 1],
    () => fetchVideos
  );
  await queryClient.prefetchQuery(
    [QueryKeys.VIDEOS, "featured", 1],
    () => fetchVideos
  );
  await queryClient.prefetchQuery(
    [QueryKeys.VIDEOS, "originals", 1],
    () => fetchVideos
  );

  await queryClient.prefetchQuery([QueryKeys.SHOWS, 1], () => fetchShows);

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

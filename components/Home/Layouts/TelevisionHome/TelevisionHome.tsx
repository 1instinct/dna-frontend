// Layouts/TelevisionHome.tsx
import React from 'react';
import { QueryClient, QueryFunction, dehydrate, useQuery } from 'react-query';
import { fetchVideos, fetchShows } from '../../../../hooks/useVideos';
import { VideoSnippet } from '../../../VideoSnippet';
// import { PostSnippet } from '../../../PostSnippet';
import { VideoSlider } from '../../../VideoSlider';

import {
  MainContent,
  HeroContainer,
  HorizontalList
} from './TelevisionHome.styles';

import { QueryKeys } from '../../../../hooks/queryKeys';
import { Loading, LoadingWrapper } from '../../..';

export const TelevisionHome: React.FC<any> = ({ wholesale }) => {
  const { data: latestData, isLoading: latestVideosLoading, isError: isLatestVideosError } = useQuery([QueryKeys.VIDEOS, 'latest', 1], fetchVideos);
  const { data: beautyConfessionalData, isLoading: beautyConfessionalLoading, isError: isBeautyConfessionalError } = useQuery([QueryKeys.VIDEOS, 'beautyConfessional', 1], fetchVideos);
  const { data: bombshellOnStreetData, isLoading: bombshellOnStreetLoading, isError: isBombshellOnStreetError } = useQuery([QueryKeys.VIDEOS, 'bombshellOnStreet', 1], fetchVideos);
  const { data: etcData, isLoading: etcLoading, isError: isEtcError } = useQuery([QueryKeys.VIDEOS, 'etcetera', 1], fetchVideos);
  const { data: exclusivesData, isLoading: exclusivesLoading, isError: isExclusivesError } = useQuery([QueryKeys.VIDEOS, 'exclusives', 1], fetchVideos);
  const { data: featuredData, isLoading: featuredLoading, isError: isFeaturedError } = useQuery([QueryKeys.VIDEOS, 'featured', 1], fetchVideos);
  const { data: girlsData, isLoading: girlsLoading, isError: isGirlsError } = useQuery([QueryKeys.VIDEOS, 'girls', 1], fetchVideos);
  const { data: liveFromData, isLoading: liveFromLoading, isError: isLiveFromError } = useQuery([QueryKeys.VIDEOS, 'liveFrom', 1], fetchVideos);
  const { data: model20Data, isLoading: model20Loading, isError: isModel20Error } = useQuery([QueryKeys.VIDEOS, 'model20', 1], fetchVideos);
  const { data: originalsData, isLoading: originalsLoading, isError: isOriginalsError } = useQuery([QueryKeys.VIDEOS, 'originals', 1], fetchVideos);
  const { data: originalsTwoData, isLoading: originalsTwoLoading, isError: isOriginalsTwoError } = useQuery([QueryKeys.VIDEOS, 'originalsTwo', 1], fetchVideos);
  const { data: specialsData, isLoading: specialsLoading, isError: isSpecialsError } = useQuery([QueryKeys.VIDEOS, 'specials', 1], fetchVideos);
  const { data: teachMeData, isLoading: teachMeLoading, isError: isTeachMeError } = useQuery([QueryKeys.VIDEOS, 'teachMe', 1], fetchVideos);
  const { data: theLatestData, isLoading: theLatestLoading, isError: isTheLatestError } = useQuery([QueryKeys.VIDEOS, 'latest', 1], fetchVideos);
  const { data: uncoveredData, isLoading: uncoveredLoading, isError: isUncoveredError } = useQuery([QueryKeys.VIDEOS, 'uncovered', 1], fetchVideos);
  const { data: vintage1Data, isLoading: vintage1Loading, isError: isVintage1Error } = useQuery([QueryKeys.VIDEOS, 'vintage/1', 1], fetchVideos);
  const { data: vintage2Data, isLoading: vintage2Loading, isError: isVintage2Error } = useQuery([QueryKeys.VIDEOS, 'vintage/2', 1], fetchVideos);
  const { data: vintage3Data, isLoading: vintage3Loading, isError: isVintage3Error } = useQuery([QueryKeys.VIDEOS, 'vintage/3', 1], fetchVideos);
  const { data: vintage4Data, isLoading: vintage4Loading, isError: isVintage4Error } = useQuery([QueryKeys.VIDEOS, 'vintage/4', 1], fetchVideos);
  const { data: vintage5Data, isLoading: vintage5Loading, isError: isVintage5Error } = useQuery([QueryKeys.VIDEOS, 'vintage/5', 1], fetchVideos);
  
  const posts = [];
  
  const isLoading = beautyConfessionalLoading || bombshellOnStreetLoading || etcLoading || exclusivesLoading || featuredLoading || girlsLoading || liveFromLoading || model20Loading || originalsLoading || specialsLoading || teachMeLoading || uncoveredLoading || vintage1Loading || vintage2Loading || vintage3Loading || vintage4Loading || vintage5Loading;
  const isError = isBeautyConfessionalError || isBombshellOnStreetError || isEtcError || isExclusivesError || isFeaturedError || isGirlsError || isLiveFromError || isModel20Error || isOriginalsError || isSpecialsError || isTeachMeError || isUncoveredError || isVintage1Error || isVintage2Error || isVintage3Error || isVintage4Error || isVintage5Error;

  const renderLatest = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    } else {
      return latestData.map((vid) => {
        return <VideoSnippet key={vid.url} vid={vid} />;
      });
    }
  }

  const renderExclusives = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    } else {
      return exclusivesData.map((vid) => {
        return <VideoSnippet key={vid.url} vid={vid} />;
      });
    }
  }

  const renderOriginals = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    } else {
      return originalsData.map((vid) => {
        return <VideoSnippet key={vid.url} vid={vid} />;
      });
    }
  }

  // const renderPosts = () => {
  //   if (isLoading) {
  //     return <div>Loading...</div>;
  //   } else {
  //     return posts.map((post) => {
  //       return <PostSnippet key={post._id} post={post} />;
  //     });
  //   }
  // }

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <LoadingWrapper>Error</LoadingWrapper>;
  }

  return (
    <MainContent>
        <HeroContainer>
          <div id="slider">
            <div id="featuredSlider" className="owl-carousel">
              <VideoSlider videos={featuredData}/>
            </div>
          </div>
        </HeroContainer>

        <div id="mainContent" className="col-sm-12 col-lg-12 col-lg-offset-0">

          <div className="contentArea">
            <h3>
              <a href="javascript:;" onClick={() => false}><span>The Latest <i className="fa fa-angle-right"></i></span></a>
            </h3>
            <HorizontalList>
              {renderLatest()}

              <a href="javascript:;" onClick={() => false} className="snippet last">
                <div className="seeMore">
                  <i className="fa fa-arrow-right"></i>
                </div>
                <h5>See More</h5>
              </a>

            </HorizontalList>
          </div>

          <div className="contentArea">
            <h3>
              <a href={""}><span>Exclusives <i className="fa fa-angle-right"></i></span></a>
            </h3>
            <HorizontalList>
              {renderExclusives()}

              <a href={""} className="snippet last">
                <div className="seeMore">
                  <i className="fa fa-arrow-right"></i>
                </div>
                <h5>See More</h5>
              </a>

            </HorizontalList>
          </div>

          <div className="featArea">
            <h3>
              <a href={""}><span>Originals <i className="fa fa-angle-right"></i></span></a>
            </h3>
            <HorizontalList>
              {renderOriginals()}

              <a href={""} className="snippet last">
                <div className="seeMore">
                  <i className="fa fa-arrow-right"></i>
                </div>
                <h5>See More</h5>
              </a>

            </HorizontalList>
          </div>

          <div className="featArea">
            <h3>
              <a href="http://galoremag.com" target="_blank"><span>Something to Read? <i className="fa fa-angle-right"></i></span></a>
            </h3>
            <HorizontalList>
              {/* {renderPosts()} */}

              <a href="https://galoremag.com" target="_blank" className="snippet last">
                <div className="seeMore">
                  <i className="fa fa-arrow-right"></i>
                </div>
                <h5>See More</h5>
              </a>

            </HorizontalList>
          </div>
        </div>
      </MainContent>
  );
};

export async function getServerSideProps() {
    const queryClient = new QueryClient();
  
    await queryClient.prefetchQuery(["latestVideos", 1], () => fetchVideos('latest', 1));
    await queryClient.prefetchQuery(["shows", 1], () => fetchShows());
  
    return {
      props: {
        dehydratedState: dehydrate(queryClient)
      }
    };
  }

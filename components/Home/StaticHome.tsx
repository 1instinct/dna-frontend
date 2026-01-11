import { useRef, useEffect } from "react";
import { useQuery } from "react-query";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { Layout, InfoBox, ProductList } from "../components";
import {
  fetchStreams,
  fetchProducts,
  useProducts,
  useStreams
} from "../../hooks/index";
import Hero from "./Hero";
import Banner from "./Banner";
import { Content } from "./StaticHome.styles";
import Featured from "./Featured";
import MemberList from "./MemberList";
import { StreamList } from "../StreamList";
import { useMediaQuery } from "react-responsive";
import MobileLatest from "./MobileLatest";
import { Loading } from "../Loading";
import homeData from "./home.json";
import { VideoJS } from "../components";
import constants from "../../utilities/constants.js";
import Products from "./Products";

export const StaticHome = (props: any) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const playerRef = useRef(null);

  const videoJsOptions = {
    autoplay: true,
    playsInline: true,
    controls: false,
    responsive: true,
    preload: "auto",
    muted: true,
    fluid: true,
    sources: [
      {
        src: "pol-fw-21.mp4",
        type: "video/mp4"
      }
    ]
  };

  const handlePlayerReady = ({ player }: any) => {
    playerRef.current = player;

    // you can handle player events here
    // player.on('waiting', () => {
    //   console.log('player is waiting');
    // });

    // player.on('dispose', () => {
    //   console.log('player will dispose');
    // });
  };

  const {
    error: productsError,
    status: productsStatus,
    data: productsData,
    isLoading: productsAreLoading,
    isSuccess: productsIsSuccess
  }: {
    error: any;
    status: any;
    data: any;
    isLoading: boolean;
    isSuccess: boolean;
  } = useProducts(1);

  const {
    error: streamsError,
    status: streamsStatus,
    data: streamsData,
    isLoading: streamsAreLoading,
    isSuccess: streamsAreSuccess
  }: {
    error: any;
    status: any;
    data: any;
    isLoading: boolean;
    isSuccess: boolean;
  } = useStreams(1);

  const memberList = isMobile ? null : (
    <MemberList data={homeData.memberList} />
  );
  const mobileMemberList = !isMobile ? null : (
    <MemberList data={homeData.memberList} />
  );
  const advertListMobile = isMobile ? (
    <MobileLatest products={productsData} title={""}></MobileLatest>
  ) : null;
  const productList = isMobile ? null : (
    <Products products={productsData} title={"New Drops This Week"} />
  );
  const banner = isMobile ? null : <Banner data={homeData.bigHotDig} />;

  if (productsAreLoading || streamsAreLoading) {
    return <Loading />;
  }

  if (productsError || streamsError) {
    return <Loading />;
  }

  return (
    <Layout>
      <Hero />
      <Content>
        {/* {memberList} */}
        {streamsData &&
          streamsData?.response_data &&
          streamsData.response_data.length > 0 && (
            <StreamList
              data={streamsData.response_data}
              title={"Live-Shopping"}
            />
          )}
        {!productsAreLoading && productList}
        {/* {mobileMemberList} */}
        <Featured data={homeData.latestProducts} title="" />
        <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
        {advertListMobile}
        {!productsAreLoading && productList}
        {banner}
      </Content>
    </Layout>
  );
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  // await queryClient.prefetchQuery(["posts", 1], () => fetchPosts(1));
  await queryClient.prefetchQuery(["streams", 1], () => fetchStreams(1));
  await queryClient.prefetchQuery(["products", 1], () => fetchProducts(1));

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

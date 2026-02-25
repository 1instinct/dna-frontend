import { useRef } from "react";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { Layout } from "../Layout";
import { ProductList } from "../ProductList";
import { BlurFade } from "@components/ui";
import {
  fetchStreams,
  fetchProducts,
  useProducts,
  useStreams
} from "../../hooks/index";
import Hero from "./Hero";
import Banner from "./Banner";
import Featured from "./Featured";
import MemberList from "./MemberList";
import { StreamList } from "../StreamList";
import { useMediaQuery } from "react-responsive";
import MobileLatest from "./MobileLatest";
import { Loading } from "../Loading";
import homeData from "./home.json";
import { VideoJS } from "../VideoJS";
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
    sources: [{ src: "pol-fw-21.mp4", type: "video/mp4" }]
  };

  const handlePlayerReady = ({ player }: any) => {
    playerRef.current = player;
  };

  const {
    error: productsError,
    data: productsData,
    isLoading: productsAreLoading
  }: any = useProducts(1);

  const {
    error: streamsError,
    data: streamsData,
    isLoading: streamsAreLoading
  }: any = useStreams(1);

  const productList = isMobile ? null : (
    <Products products={productsData} title={"New Drops This Week"} />
  );
  const banner = isMobile ? null : <Banner data={homeData.bigHotDig} />;
  const advertListMobile = isMobile ? (
    <MobileLatest products={productsData} title={""} />
  ) : null;

  if (productsAreLoading || streamsAreLoading) return <Loading />;
  if (productsError || streamsError) return <Loading />;

  return (
    <Layout>
      <Hero />
      <div className="section-container space-y-8 py-8">
        {streamsData?.response_data?.length > 0 && (
          <BlurFade delay={0.1} inView>
            <StreamList
              data={streamsData.response_data}
              title={"Live-Shopping"}
            />
          </BlurFade>
        )}
        {!productsAreLoading && productList && (
          <BlurFade delay={0.2} inView>
            {productList}
          </BlurFade>
        )}
        <BlurFade delay={0.3} inView>
          <Featured data={homeData.latestProducts} title="" />
        </BlurFade>
        <BlurFade delay={0.4} inView>
          <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
        </BlurFade>
        {advertListMobile && (
          <BlurFade delay={0.3} inView>
            {advertListMobile}
          </BlurFade>
        )}
        {!productsAreLoading && productList && (
          <BlurFade delay={0.5} inView>
            {productList}
          </BlurFade>
        )}
        {banner && (
          <BlurFade delay={0.6} inView>
            {banner}
          </BlurFade>
        )}
      </div>
    </Layout>
  );
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["streams", 1], () => fetchStreams(1));
  await queryClient.prefetchQuery(["products", 1], () => fetchProducts(1));
  return { props: { dehydratedState: dehydrate(queryClient) } };
}

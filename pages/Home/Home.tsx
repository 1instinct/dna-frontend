import React from "react";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { Layout, InfoBox, ProductList } from "../../components";
import { fetchPosts, fetchProducts } from "../../hooks";
import Banner from "./Banner";
import BigHotDig from "./BigHotDig";
import { Content } from "./Home.styles";
import LatestProducts from "./LatestProducts";
import MemberList from "./MemberList";
import Products from "./Products";
import PolProductList from "../../components/POLProductList";
import data from "./home.json";
const Home = () => {
  return (
    <Layout>
      <Banner />
      <Content>
        <MemberList data={data.memberList} />
        <Products data={data.productList} />
        <LatestProducts data={data.latestProducts} />
        <PolProductList data={data.hotDigs} title={"HOTDIGS"} />
        <BigHotDig data={data.bigHotDig} />
      </Content>
    </Layout>
  );
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(["posts", 10], () => fetchPosts(10));
  await queryClient.prefetchQuery(["products", 1], () => fetchProducts(1));

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default Home;

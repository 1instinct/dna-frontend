import React from "react";
import Head from "next/head";
import { Layout } from "@components/Layout";
import { CreatorsLanding } from "@components/Creator";

const CreatorsPage = () => (
  <Layout>
    <Head>
      <title>Sell as a creator</title>
      <meta
        name="description"
        content="Sell your digital products in our marketplace."
      />
    </Head>
    <CreatorsLanding />
  </Layout>
);

export default CreatorsPage;

"use client";
import Head from "next/head";
import { Layout } from "../Layout";

export const FourOhFour = () => {
  return (
    <Layout>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <h1 className="mb-4 font-title text-8xl font-black tracking-tight text-brand">
          404
        </h1>
        <p className="font-body text-lg text-muted-foreground">
          Whoops, keep looking...
        </p>
      </div>
    </Layout>
  );
};

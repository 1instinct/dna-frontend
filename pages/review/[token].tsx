import React from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { Layout } from "../../components/Layout";
import { ReviewRequestPage } from "../../components/Reviews/ReviewRequest";

/**
 * `/review/[token]`: the landing page for review request emails
 * (`?item=&rating=` from a star, `?opt_out=1` from the unsubscribe link).
 * Public (middleware only guards /account); the token is the credential, so
 * the page must never be indexed.
 */
const ReviewTokenPage = () => (
  <Layout>
    <Head>
      <title>Review your order</title>
      <meta name="robots" content="noindex" />
    </Head>
    <ReviewRequestPage />
  </Layout>
);

// Sent with the HTML, so they hold even before the page renders: never index a token page, and
// never send its URL (with the token) as a referrer to other sites.
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "private, no-store");
  return { props: {} };
};

export default ReviewTokenPage;

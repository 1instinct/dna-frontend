import React from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { QueryClient } from "react-query";
import { Layout } from "../components/Layout";
import {
  StoreReviewsPage,
  StoreReviewsUnavailable
} from "../components/Reviews/StoreReviews/StoreReviewsPage";
import {
  fetchStoreReviews,
  fetchStoreReviewSummary,
  storeReviewsKey,
  storeReviewSummaryKey
} from "../hooks/useStoreReviews";
import {
  isReviewsDisabledError,
  REVIEWS_ENABLED,
  STORE_NAME,
  STORE_REVIEWS_PER_PAGE
} from "../lib/reviews";
import { dehydrateForProps, seedAnonymousUser, withTimeout } from "../lib/ssr";

const SITE_TITLE = process.env.NEXT_PUBLIC_SITE_TITLE || STORE_NAME;

/**
 * `/reviews`: the store reviews page (M5).
 *
 * SEO note: no `aggregateRating` / `Review` JSON-LD here on purpose. Google
 * treats reviews a business collects about itself, shown on its own site,
 * as "self-serving" and doesn't show review snippets for them
 * (LocalBusiness / Organization). Marking them up gains nothing and risks a
 * structured-data manual action. Product reviews keep their JSON-LD on the
 * PDP (components/Reviews/ProductJsonLd.tsx).
 */
const StoreReviewsRoute = () => {
  if (!REVIEWS_ENABLED) {
    return (
      <Layout>
        <Head>
          <title>{`Page not found - ${SITE_TITLE}`}</title>
          <meta name="robots" content="noindex" />
        </Head>
        <StoreReviewsUnavailable />
      </Layout>
    );
  }
  return (
    <Layout>
      <Head>
        <title>{`Customer reviews - ${SITE_TITLE}`}</title>
        <meta
          key="description"
          name="description"
          content={`Read what customers say about shopping with ${STORE_NAME}: every published review, at every star rating.`}
        />
        <meta
          key="og:title"
          property="og:title"
          content={`Customer reviews - ${SITE_TITLE}`}
        />
      </Head>
      <StoreReviewsPage />
    </Layout>
  );
};

/**
 * Server-renders the summary and the first page of reviews (default
 * filters) so the reviews are in the HTML. A 404 while reviews are off
 * (flag or the API's 503 `not_enabled`); any other failure leaves the
 * browser to fetch.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  if (!REVIEWS_ENABLED) return { notFound: true };

  const queryClient = new QueryClient();
  seedAnonymousUser(queryClient);

  let disabled = false;
  await Promise.all([
    withTimeout((signal) => fetchStoreReviewSummary({ signal }))
      .then((summary) =>
        queryClient.setQueryData(storeReviewSummaryKey(), summary)
      )
      .catch((error) => {
        if (isReviewsDisabledError(error)) disabled = true;
      }),
    withTimeout((signal) =>
      fetchStoreReviews(
        { page: 1, per_page: STORE_REVIEWS_PER_PAGE },
        { signal }
      )
    )
      .then((firstPage) =>
        queryClient.setQueryData(storeReviewsKey({}), {
          pages: [firstPage],
          pageParams: [1]
        })
      )
      .catch(() => undefined)
  ]);

  if (disabled) return { notFound: true };

  return { props: { dehydratedState: dehydrateForProps(queryClient) } };
};

export default StoreReviewsRoute;

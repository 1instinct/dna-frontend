import type { GetServerSideProps } from "next";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { ProductDetails } from "../components/ProductDetails";
import { QueryKeys } from "../hooks/queryKeys";
import { fetchProduct, productQueryId } from "../hooks/useProduct";
import {
  fetchProductReviews,
  fetchReviewSummary,
  productReviewsKey,
  reviewSummaryKey
} from "../hooks/useReviews";
import { REVIEWS_ENABLED, REVIEWS_PER_PAGE } from "../lib/reviews";

/** react-query-auth's default query key (config/auth.ts sets no `key`). */
const AUTH_USER_QUERY_KEY = "auth-user";

/** Server fetches give up after this long; the browser then fetches instead. */
const SSR_FETCH_TIMEOUT_MS = 2500;

const withTimeout = async <T,>(
  run: (signal: AbortSignal) => Promise<T>
): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SSR_FETCH_TIMEOUT_MS);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Server-renders the PDP: the product, plus (when reviews are enabled) the
 * retail review summary and the first page of retail reviews, so the stars,
 * the visible reviews and the JSON-LD are in the HTML. Every fetch is
 * best-effort: a failure or timeout leaves that query out of the dehydrated
 * cache and the browser fetches it as before. This never throws.
 */
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const rawSlug = params?.productSlug;
  const productSlug = productQueryId(
    (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) || ""
  );
  const queryClient = new QueryClient();

  // react-query-auth's AuthProvider renders "Loading..." instead of the page
  // until its "auth-user" query succeeds, so without this the server would
  // never render the PDP. Seed an anonymous user: the browser refetches it on
  // mount (the token lives in localStorage). `updatedAt: 1` makes it older
  // than any real fetch, so hydrating on client-side navigation never
  // overwrites a signed-in user.
  queryClient.setQueryData(AUTH_USER_QUERY_KEY, null, { updatedAt: 1 });

  if (productSlug) {
    const tasks: Array<Promise<unknown>> = [
      withTimeout((signal) => fetchProduct(productSlug, { signal }))
        .then((product) =>
          queryClient.setQueryData([QueryKeys.PRODUCT, productSlug], product)
        )
        .catch(() => undefined)
    ];

    if (REVIEWS_ENABLED) {
      tasks.push(
        withTimeout((signal) =>
          fetchReviewSummary(productSlug, "retail", { auth: "none", signal })
        )
          .then((summary) =>
            queryClient.setQueryData(
              reviewSummaryKey(productSlug, "retail"),
              summary
            )
          )
          .catch(() => undefined),
        withTimeout((signal) =>
          fetchProductReviews(
            productSlug,
            { scope: "retail", page: 1, per_page: REVIEWS_PER_PAGE },
            { auth: "none", signal }
          )
        )
          .then((firstPage) =>
            queryClient.setQueryData(
              productReviewsKey(productSlug, { scope: "retail" }),
              { pages: [firstPage], pageParams: [1] }
            )
          )
          .catch(() => undefined)
      );
    }

    await Promise.all(tasks);
  }

  let dehydratedState: unknown = null;
  try {
    // Round-trip through JSON so `undefined` values can't break Next's prop serialization.
    dehydratedState = JSON.parse(JSON.stringify(dehydrate(queryClient)));
  } catch {
    dehydratedState = null;
  }

  return {
    props: {
      productSlug,
      dehydratedState
    }
  };
};

export default ProductDetails;

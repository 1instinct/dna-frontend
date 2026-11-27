import type { GetServerSideProps } from "next";
import { QueryClient } from "react-query";
import { ProductDetails } from "../components/ProductDetails";
import { QueryKeys } from "../hooks/queryKeys";
import { fetchProduct, productQueryId } from "../hooks/useProduct";
import {
  fetchProductReviews,
  fetchReviewSummary,
  productReviewsKey,
  reviewSummaryKey
} from "../hooks/useReviews";
import { fetchQuestions, questionsKey } from "../hooks/useQuestions";
import {
  QUESTIONS_PER_PAGE,
  REVIEWS_ENABLED,
  REVIEWS_PER_PAGE
} from "../lib/reviews";
import { dehydrateForProps, seedAnonymousUser, withTimeout } from "../lib/ssr";

/**
 * Server-renders the PDP: the product, plus (when reviews are enabled) the
 * retail review summary, the first page of retail reviews and the first page
 * of answered questions, so the stars, the visible reviews, the Questions tab
 * and the JSON-LD are in the HTML. Every fetch is
 * best-effort: a failure or timeout leaves that query out of the dehydrated
 * cache and the browser fetches it as before. This never throws.
 */
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const rawSlug = params?.productSlug;
  const productSlug = productQueryId(
    (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) || ""
  );
  const queryClient = new QueryClient();

  // Without a seeded "auth-user" the AuthProvider never renders the PDP (see lib/ssr.ts).
  seedAnonymousUser(queryClient);

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
          .catch(() => undefined),
        // First page of answered questions, for the Questions tab (and its count).
        withTimeout((signal) =>
          fetchQuestions(productSlug, 1, {
            signal,
            perPage: QUESTIONS_PER_PAGE
          })
        )
          .then((firstPage) =>
            queryClient.setQueryData(questionsKey(productSlug), {
              pages: [firstPage],
              pageParams: [1]
            })
          )
          .catch(() => undefined)
      );
    }

    await Promise.all(tasks);
  }

  return {
    props: {
      productSlug,
      dehydratedState: dehydrateForProps(queryClient)
    }
  };
};

export default ProductDetails;

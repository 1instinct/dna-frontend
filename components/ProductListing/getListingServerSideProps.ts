import type { GetServerSideProps } from "next";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import {
  ListingKind,
  ListingResolution,
  listingResolutionKey,
  normalizeListingSlug,
  resolveListing
} from "@hooks/useTaxons";
import {
  DEFAULT_LISTING_SORT,
  fetchProductListing
} from "@hooks/useProductListing";

/** react-query-auth's default query key (config/auth.ts sets no `key`). */
const AUTH_USER_QUERY_KEY = "auth-user";

/** Server lookups give up after this long; the browser then resolves instead. */
const SSR_FETCH_TIMEOUT_MS = 2500;

export interface ListingPageProps {
  listingKind: ListingKind;
  listingSlug: string;
}

/**
 * Resolves the category or tag on the server so the heading is in the HTML
 * and an unknown one answers HTTP 404 (the page still renders its own
 * not-found state inside the site layout). Products are fetched in the
 * browser, with the shopper's token. If the API is slow or down, nothing is
 * seeded and the browser resolves it instead. This never throws.
 */
export const getListingServerSideProps =
  (
    kind: ListingKind
  ): GetServerSideProps<ListingPageProps & { dehydratedState: unknown }> =>
  async ({ params, res }) => {
    const listingSlug = normalizeListingSlug(params?.[kind]);
    const queryClient = new QueryClient();

    // Same as pages/[productSlug].tsx: AuthProvider renders "Loading..." until
    // "auth-user" resolves, so seed an anonymous user the browser refetches.
    queryClient.setQueryData(AUTH_USER_QUERY_KEY, null, { updatedAt: 1 });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SSR_FETCH_TIMEOUT_MS);
    try {
      const resolution: ListingResolution = await resolveListing(
        kind,
        listingSlug,
        { signal: controller.signal }
      );
      queryClient.setQueryData(
        listingResolutionKey(kind, listingSlug),
        resolution
      );

      let notFound = resolution.status === "not_found";
      if (resolution.status === "search") {
        // A tag without a taxon is a name search; no matches means no such tag.
        const firstPage = await fetchProductListing(
          {
            name: resolution.query,
            page: 1,
            perPage: 1,
            sort: DEFAULT_LISTING_SORT
          },
          { signal: controller.signal }
        );
        notFound = !firstPage.meta?.total_count;
      }
      if (notFound) res.statusCode = 404;
    } catch {
      // Leave it to the browser.
    } finally {
      clearTimeout(timer);
    }

    let dehydratedState: unknown = null;
    try {
      dehydratedState = JSON.parse(JSON.stringify(dehydrate(queryClient)));
    } catch {
      dehydratedState = null;
    }

    return {
      props: {
        listingKind: kind,
        listingSlug,
        dehydratedState
      }
    };
  };

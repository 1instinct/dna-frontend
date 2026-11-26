import {
  ListingPageProps,
  ProductListing,
  getListingServerSideProps
} from "../../components/ProductListing";

/**
 * /tag/<slug>: products in the taxon `tags/<slug>` when a "Tags" taxonomy
 * exists, otherwise products whose name matches the tag (see hooks/useTaxons).
 */
export const getServerSideProps = getListingServerSideProps("tag");

const TagPage = ({ listingSlug }: ListingPageProps) => (
  <ProductListing kind="tag" slug={listingSlug} />
);

export default TagPage;

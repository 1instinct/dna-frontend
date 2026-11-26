import {
  ListingPageProps,
  ProductListing,
  getListingServerSideProps
} from "../../components/ProductListing";

/** /category/<slug>: products in the taxon `categories/<slug>` (see hooks/useTaxons). */
export const getServerSideProps = getListingServerSideProps("category");

const CategoryPage = ({ listingSlug }: ListingPageProps) => (
  <ProductListing kind="category" slug={listingSlug} />
);

export default CategoryPage;

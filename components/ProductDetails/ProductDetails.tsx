import React from "react";
import { RetailProductDetails } from "./RetailProductDetails";
import { WholesaleProductDetails } from "./WholesaleProductDetails";

export interface ProductDetailsProps {
  /** From pages/_app.tsx: the signed-in account's `is_wholesale` flag. */
  wholesale?: boolean;
  /** From the page's getServerSideProps; without it the PDP derives it from the URL. */
  productSlug?: string;
  [key: string]: any;
}

/**
 * Picks the retail or wholesale PDP and passes the page props through.
 * Re-exported as the default page by pages/[productSlug].tsx (SSR).
 */
export const ProductDetails = ({
  wholesale,
  ...pageProps
}: ProductDetailsProps) => {
  if (wholesale) {
    return <WholesaleProductDetails {...pageProps} wholesale />;
  }
  return <RetailProductDetails {...pageProps} wholesale={false} />;
};

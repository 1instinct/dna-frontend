import React from "react";
import { RetailProductDetails } from "./RetailProductDetails";
import { WholesaleProductDetails } from "./WholesaleProductDetails";

interface ProductDetailsProps {
  props: any;
  wholesale?: boolean;
}

export const ProductDetails = ({ wholesale, props }: ProductDetailsProps) => {
  if (wholesale) {
    return <WholesaleProductDetails {...props} wholesale />;
  } else {
    return <RetailProductDetails {...props} wholesale />;
  }
}

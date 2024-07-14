import React from "react";
import { ProductTeaserProps } from "./types";
import { Loading } from "..";

import {
  ProductsRow,
  ProductContainer,
  ProductImg,
  ProductTitle,
  ProductSection
} from "./productteaser-styles";

export const ProductTeaser: React.FC<ProductTeaserProps> = (props: any) => {
  const { products, title, openSlideshow } = props;

  if (!products) return <Loading />;

  return (
    <ProductSection>
      <ProductTitle>{title}</ProductTitle>
      <ProductsRow>
        {products?.data?.map((product: any) => {
          const defaultImg =
            "https://static-assets.strikinglycdn.com/images/ecommerce/ecommerce-default-image.png";
          const productImg = product.relationships?.images?.data[0]?.id;
          const allImages = products
            ? products?.included?.filter((e: any) => e.type == "image")
            : [];
          const foundImg = allImages
            ? allImages.filter((e: any) => e["id"] == productImg)
            : undefined;
          const imgUrl =
            foundImg !== undefined
              ? foundImg[0]?.attributes?.styles[4]?.url
              : "";
          const imgSrc = productImg
            ? `${process.env.NEXT_PUBLIC_SPREE_API_URL}${imgUrl}`
            : defaultImg;
          return (
            <div key={product.id}>
              <ProductContainer>
                <ProductImg
                  src={imgSrc}
                  onClick={(e: any) => openSlideshow(true)}
                />
                <ProductTitle>{product.attributes.name}</ProductTitle>
              </ProductContainer>
            </div>
          );
        })}
      </ProductsRow>
    </ProductSection>
  );
};

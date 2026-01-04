import React from "react";
// import Link from "next/link";
import { useRouter } from "next/router";
// import { useProducts } from "../../hooks/useProducts";
import { ProductListProps } from "./types";
import styled from "@emotion/styled";
import { ProductCard } from "@components/ProductCard/ProductCard";

import {
  ProductsRow,
  ProductContainer,
  MyImg,
  MyH1,
  MySection,
  MyLi,
  MyDiv
} from "./ProductList.styles";
import { Loading } from "@components/Loading";

export const ProductList: React.FC<ProductListProps> = (props: any) => {
  const router = useRouter();
  const { products, title } = props;
  // const { data: products, isLoading, isSuccess } = useProducts(1);
  // if (isLoading) return <MyDiv>Loading</MyDiv>;

  // if (!isSuccess) {
  //   return <MyDiv>Could not load products</MyDiv>;
  // }

  if (!products) return <Loading />;

  return (
    <MySection>
      <MyH1>{title}</MyH1>
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

          // Get option values (colors) for this product's actual variants
          const variantIds =
            product.relationships?.variants?.data?.map((v: any) => v.id) || [];

          // Find variant objects in included array
          const productVariants = products?.included?.filter(
            (item: any) =>
              item.type === "variant" && variantIds.includes(item.id)
          );

          // Get all option_value IDs from these variants
          const variantOptionValueIds =
            productVariants?.flatMap(
              (variant: any) =>
                variant.relationships?.option_values?.data?.map(
                  (ov: any) => ov.id
                ) || []
            ) || [];

          // Find the actual option_value objects that are colors
          const allOptions = products?.included?.filter(
            (e: any) => e.type === "option_value"
          );

          const foundOptions =
            allOptions?.filter(
              (opt: any) =>
                variantOptionValueIds.includes(opt.id) &&
                opt.attributes.presentation.includes("#")
            ) || [];

          return (
            <ProductCard
              key={product.id}
              item={product}
              imgSrc={imgSrc}
              opts={foundOptions}
            />
          );
        })}
      </ProductsRow>
    </MySection>
  );
};

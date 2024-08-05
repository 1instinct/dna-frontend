import React from "react";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";
import { QueryKeys } from "@hooks/queryKeys";
import { useMutation } from "react-query";
import { AddItem } from "@spree/storefront-api-v2-sdk/types/interfaces/endpoints/CartClass";
import { addItemToCart } from "@hooks/useCart";

import {
  ProductCardWrapper,
  ProductImgWrapper,
  ProductImg,
  ProductTitle,
  ProductDesc,
  ProductFooter,
  ProductFooterLeft,
  ProductFooterRight,
  // ProductRate,
  Price,
  AddToCartButton,
  ThreeDot,
  Dot
  // Dot1,
  // Dot2,
  // Dot3
} from "./ProductCard.styles";
import constants from "@utilities/constants";

export const ProductCard = ({ imgSrc, item, opts }: any) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const addToCart = useMutation(addItemToCart, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
    }
  });

  const handleAddToCart = (item: AddItem) => {
    addToCart.mutate(item);
  };

  constants.IS_DEBUG && console.log("Product Card: ", item, "Opts: ", opts);
  return (
    <ProductCardWrapper>
      <>
        <ProductImgWrapper>
          <ProductImg
            src={imgSrc}
            onClick={(e) => router.push(`${item.attributes.slug}`)}
          />
        </ProductImgWrapper>
        <ProductFooter>
          <ProductFooterLeft>
            <ProductTitle>{item.attributes.name}</ProductTitle>
            {/* <ProductDesc>{item.attributes.description}</ProductDesc> */}
            <ThreeDot>
              {opts?.slice(0, 2).map((opt: any, index: any) => {
                constants.IS_DEBUG && console.log("opt: ", opt);
                return (
                  <Dot
                    key={`color-${index}`}
                    as={"span"}
                    color={opt?.attributes?.presentation}
                  ></Dot>
                );
              })}
            </ThreeDot>
          </ProductFooterLeft>
          <ProductFooterRight>
            {/* <ProductRate name="simple-controlled" value={item.attributes.rate} /> */}
            <Price>${item.attributes.price}</Price>
            <AddToCartButton
              onClick={() =>
                handleAddToCart({
                  variant_id: item.relationships.default_variant.data.id,
                  quantity: 1
                  // public_metadata: {
                  //   first_item_order: true
                  // },
                  // private_metadata: {
                  //   recommended_by_us: false
                  // }
                  // options?: {
                  //     [key: string]: string;
                  // };
                })
              }
            >
              + <i className="bts bt-shopping-cart" />
            </AddToCartButton>
          </ProductFooterRight>
        </ProductFooter>
      </>
    </ProductCardWrapper>
  );
};

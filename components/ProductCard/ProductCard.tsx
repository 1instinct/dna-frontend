import React from "react";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";
import { QueryKeys } from "@hooks/queryKeys";
import { useMutation } from "react-query";
import { AddItem } from "@spree/storefront-api-v2-sdk/types/interfaces/endpoints/CartClass";
import { addItemToCart } from "@hooks/useCart";
import { useToggleFavorite, useCheckFavorite } from "@hooks/useFavorites";
import { useAuth } from "@config/auth";

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
  Dot,
  FavoriteButton
  // Dot1,
  // Dot2,
  // Dot3
} from "./ProductCard.styles";
import constants from "@utilities/constants";
import { IProduct } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { encode } from "punycode";

export const ProductCard = ({ imgSrc, item, opts }: any) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const variantId = item.relationships.default_variant.data.id;

  const { data: favoriteCheck } = useCheckFavorite(variantId, !!user);
  const toggleFavorite = useToggleFavorite();

  const addToCart = useMutation(addItemToCart, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
      constants.IS_DEBUG && console.log("Item added to cart successfully");
    },
    onError: (error: any) => {
      console.error("Failed to add item to cart:", error);
    }
  });

  const handleAddToCart = (item: AddItem) => {
    constants.IS_DEBUG && console.log("Adding to cart:", item);
    addToCart.mutate(item);
  };

  const handleToggleFavorite = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (!user) {
      const redirectUrl = encodeURIComponent(`/${product.attributes.slug}`);
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }
    toggleFavorite.mutate(variantId);
  };

  // console.log("ProductCard opts:", opts);
  // console.log("ProductCard item:", item.attributes.name);

  // constants.IS_DEBUG && console.log("Product Card: ", item, "Opts: ", opts);
  return (
    <ProductCardWrapper>
      <>
        <ProductImgWrapper>
          <ProductImg
            src={imgSrc}
            onClick={(e) => router.push(`${item.attributes.slug}`)}
          />
          <FavoriteButton
            onClick={(e) => handleToggleFavorite(e, item)}
            isFavorited={favoriteCheck?.is_favorited}
          >
            {favoriteCheck?.is_favorited ? "❤️" : "🤍"}
          </FavoriteButton>
        </ProductImgWrapper>
        <ProductFooter>
          <ProductFooterLeft>
            <ProductTitle>{item.attributes.name}</ProductTitle>
            {/* <ProductDesc>{item.attributes.description}</ProductDesc> */}
            <ThreeDot>
              {opts?.map((opt: any, index: any) => {
                // constants.IS_DEBUG && console.log("opt: ", opt);
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

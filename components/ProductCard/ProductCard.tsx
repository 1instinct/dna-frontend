import React from "react";
import { useRouter } from "next/router";

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
  ThreeDot,
  Dot
  // Dot1,
  // Dot2,
  // Dot3
} from "./ProductCard.styles";

export const ProductCard = ({ imgSrc, item, opts }: any) => {
  const router = useRouter();
  // console.log("Card: ", item);
  return (
    <ProductCardWrapper onClick={(e) => router.push(`${item.attributes.slug}`)}>
      <>
        <ProductImgWrapper>
          <ProductImg src={imgSrc} />
        </ProductImgWrapper>
        <ProductFooter>
          <ProductFooterLeft>
            <ProductTitle>{item.attributes.name}</ProductTitle>
            {/* <ProductDesc>{item.attributes.description}</ProductDesc> */}
            <ThreeDot>
              {opts.slice(0, 5).map((opt: any, index: any) => {
                // console.log("opt: ", opt);
                return (
                  <Dot
                    key={`color-${index}`}
                    as={"span"}
                    color={opt.attributes.presentation}
                  ></Dot>
                );
              })}
            </ThreeDot>
          </ProductFooterLeft>
          <ProductFooterRight>
            {/* <ProductRate name="simple-controlled" value={item.attributes.rate} /> */}
            <Price>${item.attributes.price}</Price>
          </ProductFooterRight>
        </ProductFooter>
      </>
    </ProductCardWrapper>
  );
};

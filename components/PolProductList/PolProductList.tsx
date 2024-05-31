import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { IProduct } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { fetchStreams, fetchProducts, useProducts, useStreams } from "../../hooks";
import {
  Container,
  Dot1,
  Dot2,
  Dot3,
  MyProductTitle,
  Price,
  ProductDesc,
  ProductFooter,
  ProductFooterLeft,
  ProductFooterRight,
  ProductImg,
  ProductImgOutterBox,
  ProductRate,
  ThreeDot,
  Title
} from "./PolProductList.styles";
export type product = { title: string; desc: string; img: string; price: string; rate: number };
export type ProductListProps = {
  data?: IProduct[];
  included?: any;
  meta?: any;
  links?: any;
};
export interface PolProductListProps {
  data: ProductListProps;
  title?: string;
}
export const PolProductList: React.FC<PolProductListProps> = (props) => {
  const { data, title } = props;
  const { data: products, isLoading, isSuccess } = useProducts(1);

  useEffect(() => {
    if (products) {
      // console.log("PRODUCTS: ", data);
    }
  }, []);

  // if (isLoading) return <div>Loading</div>;

  // if (!isSuccess) {
  //   return <div>Could not load products</div>;
  // }

  return (
    <Container>
      <Title>{props.title}</Title>
      <Swiper
        loop={true}
        spaceBetween={20}
        slidesPerView={4}
        watchSlidesVisibility={true}
        watchSlidesProgress={true}
      >
        {products?.data.map((item: any, index: any) => {
          const defaultImg =
            "https://static-assets.strikinglycdn.com/images/ecommerce/ecommerce-default-image.png";
          const productImg = item.relationships?.images?.data[0]?.id;
          const foundImg = data?.included.filter((e: any) => e["id"] == productImg);
          const imgUrl = foundImg[0]?.attributes?.styles[4].url;
          const imgSrc = productImg ? `${process.env.SPREE_API_URL}${imgUrl}` : defaultImg;
          // console.log(item, productImg, foundImg, imgUrl);
          return (
            <SwiperSlide key={index}>
              <a href={`${item.attributes.slug}`}>
              <ProductImgOutterBox>
                <ProductImg src={imgSrc} />
              </ProductImgOutterBox>
              <ProductFooter>
                <ProductFooterLeft>
                  <MyProductTitle>{item.attributes.name}</MyProductTitle>
                  {/* <ProductDesc>{item.attributes.description}</ProductDesc> */}
                  <ThreeDot>
                    <Dot1 as={"span"}></Dot1>
                    <Dot2 as={"span"}></Dot2>
                    <Dot3 as={"span"}></Dot3>
                  </ThreeDot>
                </ProductFooterLeft>
                <ProductFooterRight>
                  <ProductRate name="simple-controlled" value={item.attributes.rate} />
                  <Price>${item.attributes.price}</Price>
                </ProductFooterRight>
                </ProductFooter>
              </a>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Container>
  );
};
import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { IProducts } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { fetchStreams, fetchProducts, useProducts, useStreams } from "../../hooks";
import { ProductCard } from "../ProductCard";
import { Container, Title } from "./PolProductList.styles";

// export interface ProductListProps {
//   data?: IProducts;
//   included?: any;
//   meta?: any;
//   links?: any;
// }
export interface PolProductListProps {
  products?: IProducts;
  title?: string;
}
export const PolProductList: React.FC<PolProductListProps> = (props) => {
  const { data, title } = props;
  const { data: products, isLoading, isSuccess } = useProducts(1);

  if (products && Array.isArray(products.data)) {
    return (
      <Container>
        <Title>{props.title}</Title>
        <Swiper
          // loop={true}
          spaceBetween={20}
          slidesPerView={4}
          watchSlidesVisibility={true}
          watchSlidesProgress={true}
        >
          {products?.data?.map((item: any, index: any) => {
            const defaultImg =
              "https://static-assets.strikinglycdn.com/images/ecommerce/ecommerce-default-image.png";
            const productImg = item.relationships?.images?.data[0]?.id;
            const allImages = products
              ? products?.included?.filter((e: any) => e.type == "image")
              : [];
            const foundImg = allImages
              ? allImages.filter((e: any) => e["id"] == productImg)
              : undefined;
            const imgUrl = foundImg !== undefined ? foundImg[0]?.attributes?.styles[4]?.url : "";
            const imgSrc = productImg ? `${process.env.SPREE_API_URL}${imgUrl}` : defaultImg;

  // if (isLoading) return <div>Loading</div>;

  // if (!isSuccess) {
  //   return <div>Could not load products</div>;
  // }

  return (
    <Container>
      <Title>{props.title}</Title>
      <Swiper
        // loop={true}
        spaceBetween={20}
        slidesPerView={4}
        watchSlidesVisibility={true}
        watchSlidesProgress={true}
      >
        {products?.data?.map((item: any, index: any) => {
          const defaultImg =
            "https://static-assets.strikinglycdn.com/images/ecommerce/ecommerce-default-image.png";
          const productImg = item.relationships?.images?.data[0]?.id;
          const allImages = products && products?.included?.filter((e: any) => e.type == "image");
          const foundImg = allImages.filter((e: any) => e["id"] == productImg);
          const imgUrl = foundImg[0]?.attributes?.styles[4]?.url;
          const imgSrc = productImg ? `${process.env.SPREE_API_URL}${imgUrl}` : defaultImg;

          let optionTypes = item.relationships?.option_types?.data;
          let productOptionIds = optionTypes.map((i: any) => i.id);
          let allOptions =
            products && products?.included?.filter((e: any) => e.type == "option_value");
          let productVariantColors =
            allOptions && allOptions?.filter((e: any) => e.attributes.presentation.includes("#"));
          let foundOptions = productVariantColors.filter((i: any) => {
            // console.log("foundOption: ", i.relationships.option_type.data.id);
            return productOptionIds.includes(i.relationships.option_type.data.id);
          });
          // console.log("list: ", products, productVariantColors, foundOptions);
          return (
            <SwiperSlide key={index}>
              <ProductCard item={item} imgSrc={imgSrc} opts={foundOptions} />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Container>
  );
};

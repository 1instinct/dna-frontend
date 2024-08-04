import React from "react";
import Rating from "@material-ui/lab/Rating";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductCard } from "../..";
import { SwiperWrap, Title } from "./Products.styles";
import SwiperCore, { Navigation, Thumbs } from "swiper/core";
import { useMediaQuery } from "react-responsive";
import { IProducts } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import constants from "@utilities/constants";
export type product = {
  title: string;
  subTitle: string;
  subText: string;
  influencer: string;
  rate: number;
  viewer: string;
  img: string;
  avatar: string;
  status: number;
};
export interface ProductsProps {
  products: IProducts;
  title: string;
}
SwiperCore.use([Navigation, Thumbs]);
const Products: React.FC<ProductsProps> = (props) => {
  const { products, title } = props;
  const isMobile = useMediaQuery({ maxWidth: 767 });
  constants.IS_DEBUG && console.log("products: ", products);

  const optionValuesLookup = products?.included
    ?.filter((item) => item.type === "option_value")
    .reduce((acc: any, curr) => {
      const optionTypeId = curr.relationships.option_type.data.id;
      if (!acc[optionTypeId]) {
        acc[optionTypeId] = [];
      }
      acc[optionTypeId].push(curr.attributes);
      return acc;
    }, {});

  return (
    <SwiperWrap>
      <Title>{title}</Title>
      <Swiper
        loop={true}
        spaceBetween={20}
        slidesPerView={isMobile ? 2 : 5}
        watchSlidesVisibility={true}
        watchSlidesProgress={true}
      >
        {products?.data?.map((item: any, index: any) => {
          constants.IS_DEBUG && console.log(item);
          const defaultImg =
            "https://static-assets.strikinglycdn.com/images/ecommerce/ecommerce-default-image.png";
          const productImg = item.relationships?.images?.data[0]?.id;
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

          const optionTypes = item.relationships?.option_types?.data || [];
          const productOptions = optionTypes
            .map((ot: any) => optionValuesLookup[ot.id])
            .filter(Boolean);
          let productOptionIds = optionTypes.map((i: any) => i.id);
          let allOptions =
            products &&
            products?.included?.filter((e: any) => e.type == "option_value");
          let productVariantColors = allOptions
            ? allOptions?.filter((e: any) =>
                e.attributes.presentation.includes("#")
              )
            : null;
          let foundOptions =
            productVariantColors !== null
              ? productVariantColors.filter((i: any) => {
                  constants.IS_DEBUG &&
                    console.log(
                      "foundOption: ",
                      i.relationships.option_type.data.id
                    );
                  return productOptionIds.includes(
                    i.relationships.option_type.data.id
                  );
                })
              : null;
          return (
            <SwiperSlide key={index}>
              <ProductCard item={item} imgSrc={imgSrc} opts={productOptions} />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </SwiperWrap>
  );
};
export default Products;

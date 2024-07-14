import React from "react";
import Rating from "@material-ui/lab/Rating";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductCard } from "../..";
import {
  InfluencerAvatar,
  InfluencerBox,
  InfluencerName,
  MyProductTitle,
  ProductDescBox,
  ProductImg,
  ProductImgOutterBox,
  ProductPrice,
  MySwiperWrap,
  MySlideWrap,
  Title,
  ProductMask,
  MaskTitle,
  MyProductSubTitle,
  MyProductSubText,
  MaskTitleChecked
} from "./Products.styles";
import SwiperCore, { Navigation, Thumbs } from "swiper/core";
import { useMediaQuery } from "react-responsive";
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
  data: product[];
  title: string;
}
SwiperCore.use([Navigation, Thumbs]);
const Products: React.FC<ProductsProps> = (props) => {
  const { data, title } = props;
  const isMobile = useMediaQuery({ maxWidth: 767 });
  return (
    <MySwiperWrap>
      <Title>{title}</Title>
      <Swiper
        loop={true}
        spaceBetween={0}
        slidesPerView={isMobile ? 2 : 7}
        watchSlidesVisibility={true}
        watchSlidesProgress={true}
      >
        {data.map((item, index) => {
          console.log(item);
          return (
            <SwiperSlide key={index}>
              <ProductCard item={item} />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </MySwiperWrap>
  );
};
export default Products;

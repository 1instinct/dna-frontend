import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductCard } from "../../ProductCard";
import SwiperCore, { Navigation, Thumbs } from "swiper/core";
import { useMediaQuery } from "react-responsive";
import { IProducts } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import Link from "next/link";
import { pickGridMedia } from "@lib/productMedia";

export interface ProductsProps {
  products: IProducts;
  title: string;
}

SwiperCore.use([Navigation, Thumbs]);

const Products: React.FC<ProductsProps> = ({ products, title }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const optionValuesLookup =
    products?.included
      ?.filter((item) => item.type === "option_value")
      .reduce((acc: any, curr) => {
        const optionTypeId = curr.relationships.option_type.data.id;
        if (!acc[optionTypeId]) acc[optionTypeId] = [];
        acc[optionTypeId].push(curr.attributes);
        return acc;
      }, {}) || {};

  return (
    <div className="my-8 overflow-hidden">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="heading-lg">{title}</h2>
        <Link
          href="/browse"
          className="text-sm text-brand hover:underline transition-colors"
        >
          View All
        </Link>
      </div>
      <Swiper
        loop={true}
        spaceBetween={20}
        slidesPerView={isMobile ? 2 : 5}
        watchSlidesVisibility={true}
        watchSlidesProgress={true}
      >
        {products?.data?.map((item: any, index: any) => {
          const media = pickGridMedia(item, products?.included as any, {
            baseUrl: process.env.NEXT_PUBLIC_SPREE_API_URL || ""
          });

          const optionTypes = item.relationships?.option_types?.data || [];
          const productOptions = optionTypes
            .map((ot: any) => optionValuesLookup[ot.id])
            .filter(Boolean);

          return (
            <SwiperSlide key={index}>
              <ProductCard item={item} media={media} opts={productOptions} />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};
export default Products;

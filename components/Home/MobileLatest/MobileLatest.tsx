import React from "react";
import { ProductCard } from "../../ProductCard";

export interface MobileLatestProps {
  products: any;
  title: string;
}

const MobileLatest: React.FC<MobileLatestProps> = ({ title, products }) => {
  return (
    <div className="mb-8">
      {title && (
        <h2 className="heading-lg my-5 text-center underline">{title}</h2>
      )}
      <div className="product-grid-dense">
        {products?.data?.map((item: any, index: number) => {
          const defaultImg =
            "https://static-assets.strikinglycdn.com/images/ecommerce/ecommerce-default-image.png";
          const productImg = item.relationships?.images?.data[0]?.id;
          const allImages =
            products?.included?.filter((e: any) => e.type === "image") || [];
          const foundImg = allImages.filter((e: any) => e.id === productImg);
          const imgUrl = foundImg[0]?.attributes?.styles[4]?.url;
          const imgSrc = productImg
            ? `${process.env.NEXT_PUBLIC_SPREE_API_URL}${imgUrl}`
            : defaultImg;

          const optionTypes = item.relationships?.option_types?.data || [];
          const productOptionIds = optionTypes.map((i: any) => i.id);
          const allOptions =
            products?.included?.filter((e: any) => e.type === "option_value") ||
            [];
          const productVariantColors = allOptions.filter((e: any) =>
            e.attributes.presentation.includes("#")
          );
          const foundOptions = productVariantColors.filter((i: any) =>
            productOptionIds.includes(i.relationships.option_type.data.id)
          );

          return (
            <ProductCard
              key={item.id || `product-${index}`}
              item={item}
              imgSrc={imgSrc}
              opts={foundOptions}
            />
          );
        })}
      </div>
    </div>
  );
};
export default MobileLatest;

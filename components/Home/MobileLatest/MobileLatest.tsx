import React from "react";
import { ProductCard } from "../../ProductCard";
import { pickGridMedia } from "@lib/productMedia";

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
          const media = pickGridMedia(item, products?.included as any, {
            baseUrl: process.env.NEXT_PUBLIC_SPREE_API_URL || ""
          });

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
              media={media}
              opts={foundOptions}
            />
          );
        })}
      </div>
    </div>
  );
};
export default MobileLatest;

import React from "react";
import { ProductListProps } from "./types";
import { ProductCard } from "@components/ProductCard/ProductCard";
import { Loading } from "@components/Loading";

export const ProductList: React.FC<ProductListProps> = (props: any) => {
  const { products, title } = props;

  if (!products) return <Loading />;

  return (
    <section className="w-full pb-5 mb-5">
      {title && (
        <h1 className="font-title text-xl text-foreground">{title}</h1>
      )}
      <div className="product-grid-dense">
        {products?.data?.map((product: any) => {
          const defaultImg =
            "https://static-assets.strikinglycdn.com/images/ecommerce/ecommerce-default-image.png";
          const productImg = product.relationships?.images?.data[0]?.id;
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

          // Get option values (colors) for this product's actual variants
          const variantIds =
            product.relationships?.variants?.data?.map((v: any) => v.id) || [];

          const productVariants = products?.included?.filter(
            (item: any) =>
              item.type === "variant" && variantIds.includes(item.id)
          );

          const variantOptionValueIds =
            productVariants?.flatMap(
              (variant: any) =>
                variant.relationships?.option_values?.data?.map(
                  (ov: any) => ov.id
                ) || []
            ) || [];

          const allOptions = products?.included?.filter(
            (e: any) => e.type === "option_value"
          );

          const foundOptions =
            allOptions?.filter(
              (opt: any) =>
                variantOptionValueIds.includes(opt.id) &&
                opt.attributes.presentation.includes("#")
            ) || [];

          return (
            <ProductCard
              key={product.id}
              item={product}
              imgSrc={imgSrc}
              opts={foundOptions}
            />
          );
        })}
      </div>
    </section>
  );
};

import React from "react";
import { pickGridMedia } from "@lib/productMedia";
import { ProductCard } from "@components/ProductCard/ProductCard";
import { Loading } from "@components/Loading";

interface ProductListProps {
  products: any;
  title?: string;
  layout?: "grid" | "scroll";
  excludeProductId?: string;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  title,
  layout = "grid",
  excludeProductId
}) => {
  if (!products) return <Loading />;

  const filteredData = excludeProductId
    ? products?.data?.filter((p: any) => p.id !== excludeProductId)
    : products?.data;

  if (!filteredData || filteredData.length === 0) return null;

  const isScroll = layout === "scroll";

  return (
    <section className="w-full pb-5">
      {title && <h2 className="font-title text-xl text-foreground">{title}</h2>}
      <div
        className={
          isScroll
            ? "mt-3 flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible lg:grid-cols-5"
            : "product-grid-dense"
        }
      >
        {filteredData.map((product: any) => {
          // First playable video, else first animated image, else first image.
          const media = pickGridMedia(product, products?.included, {
            baseUrl: process.env.NEXT_PUBLIC_SPREE_API_URL || ""
          });

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
            <div
              key={product.id}
              className={isScroll ? "w-40 flex-shrink-0 md:w-auto" : undefined}
            >
              <ProductCard item={product} media={media} opts={foundOptions} />
            </div>
          );
        })}
      </div>
    </section>
  );
};

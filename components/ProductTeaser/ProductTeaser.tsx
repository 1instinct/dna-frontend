import React from "react";
import { ProductTeaserProps } from "./types";
import { Loading } from "../Loading";
import { ProductMedia } from "../ProductMedia";
import { pickGridMedia } from "../../lib/productMedia";

const DEFAULT_IMG =
  "https://static-assets.strikinglycdn.com/images/ecommerce/ecommerce-default-image.png";

export const ProductTeaser: React.FC<ProductTeaserProps> = (props: any) => {
  const { products, title, openSlideshow } = props;

  if (!products) return <Loading />;

  return (
    <section className="w-full pb-5">
      {title && <p className="font-body text-sm text-foreground">{title}</p>}
      <div className="product-grid-dense">
        {products?.data?.map((product: any) => {
          const media = pickGridMedia(product, products?.included, {
            baseUrl: process.env.NEXT_PUBLIC_SPREE_API_URL || "",
            posterWidth: 1000
          });
          return (
            <div key={product.id}>
              <div className="flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={() => openSlideshow(true)}
                  aria-label={product.attributes.name}
                  className="cursor-pointer border-0 bg-transparent p-0"
                >
                  <ProductMedia
                    media={media}
                    surface="grid"
                    className="h-[300px] w-[240px]"
                    mediaClassName="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                    placeholder={
                      <img
                        src={DEFAULT_IMG}
                        alt={product.attributes.name}
                        className="h-full w-full object-contain"
                      />
                    }
                  />
                </button>
                <p className="mt-2 font-body text-sm text-foreground">
                  {product.attributes.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

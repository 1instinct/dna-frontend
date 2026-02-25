import React from "react";
import { ProductTeaserProps } from "./types";
import { Loading } from "../Loading";

export const ProductTeaser: React.FC<ProductTeaserProps> = (props: any) => {
  const { products, title, openSlideshow } = props;

  if (!products) return <Loading />;

  return (
    <section className="w-full pb-5">
      {title && (
        <p className="font-body text-sm text-foreground">{title}</p>
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
          return (
            <div key={product.id}>
              <div className="flex flex-col items-center justify-center">
                <img
                  src={imgSrc}
                  onClick={() => openSlideshow(true)}
                  alt={product.attributes.name}
                  className="h-[300px] w-[240px] cursor-pointer object-contain transition-transform duration-300 hover:scale-105"
                />
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

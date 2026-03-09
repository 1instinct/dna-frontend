import React from "react";
import {
  ProductCard,
  PlaceholderProductCard,
  PlaceholderShopProduct
} from "@components/ProductCard/ProductCard";
import {
  MarketplaceCard,
  MarketplaceProduct
} from "@components/Browse/MarketplaceCard";
import { Loading } from "@components/Loading";
import { BrowseMode } from "@components/Browse/ModeToggle";

interface ProductListProps {
  /** Spree API product data */
  products?: any;
  /** Static shop product placeholders */
  placeholderProducts?: PlaceholderShopProduct[];
  /** Static marketplace product placeholders */
  marketplaceProducts?: MarketplaceProduct[];
  title?: string;
  layout?: "grid" | "scroll";
  excludeProductId?: string;
  /** Browse page mode — controls grid layout and card type */
  mode?: BrowseMode;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  placeholderProducts,
  marketplaceProducts,
  title,
  layout = "grid",
  excludeProductId,
  mode
}) => {
  // ── Marketplace mode ──
  if (mode === "marketplace" && marketplaceProducts) {
    return (
      <section className="w-full pb-5">
        {title && <h2 className="font-title text-xl text-white">{title}</h2>}
        <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {marketplaceProducts.map((product, i) => (
            <MarketplaceCard key={product.slug} product={product} index={i} />
          ))}
        </div>
      </section>
    );
  }

  // ── Shop mode with placeholder data ──
  if (mode === "shop" && placeholderProducts) {
    return (
      <section className="w-full pb-5">
        {title && <h2 className="font-title text-xl text-white">{title}</h2>}
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {placeholderProducts.map((product, i) => (
            <PlaceholderProductCard
              key={product.slug}
              product={product}
              index={i}
            />
          ))}
        </div>
      </section>
    );
  }

  // ── Original Spree-powered product list ──
  if (!products) return <Loading />;

  const filteredData = excludeProductId
    ? products?.data?.filter((p: any) => p.id !== excludeProductId)
    : products?.data;

  if (!filteredData || filteredData.length === 0) return null;

  const isScroll = layout === "scroll";

  // When mode is "shop" (with Spree data), use the shop grid
  const useShopGrid = mode === "shop";

  return (
    <section className="w-full pb-5">
      {title && <h2 className="font-title text-xl text-white">{title}</h2>}
      <div
        className={
          isScroll
            ? "mt-3 flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible lg:grid-cols-5"
            : useShopGrid
            ? "mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            : "product-grid-dense"
        }
      >
        {filteredData.map((product: any) => {
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
            <div
              key={product.id}
              className={isScroll ? "w-40 flex-shrink-0 md:w-auto" : undefined}
            >
              <ProductCard item={product} imgSrc={imgSrc} opts={foundOptions} />
            </div>
          );
        })}
      </div>
    </section>
  );
};

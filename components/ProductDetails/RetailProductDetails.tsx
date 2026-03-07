import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@lib/utils";
import {
  fetchStreams,
  fetchProducts,
  fetchVariants,
  useProducts,
  useStreams,
  useVariants
} from "../../hooks";
import { useToggleFavorite, useCheckFavorite } from "../../hooks/useFavorites";
import { useAuth } from "../../config/auth";
import { Layout } from "../Layout";
import { Loading } from "../Loading";
import { useProduct, fetchProduct } from "../../hooks/useProduct";
import { useMutation, useQueryClient } from "react-query";
import { addItemToCart } from "../../hooks/useCart";
import { QueryKeys } from "../../hooks/queryKeys";
import * as tracking from "../../config/tracking";
import Featured from "../Home/Featured";
import { ProductList } from "../ProductList";
import { FourOhFour } from "../404/FourOhFour";
import { useMediaQuery } from "react-responsive";
import homeData from "../Home/home.json";
import { useProductFeed } from "../../hooks/useProductFeed";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import { RecentlyViewed } from "../RecentlyViewed";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@components/ui";
import constants from "../../utilities/constants";

interface RetailProductDetailsProps {
  wholesale?: boolean;
  [key: string]: any;
}

export const RetailProductDetails = ({
  wholesale,
  ...props
}: RetailProductDetailsProps) => {
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { user } = useAuth();
  const productSlug = (router.query.productSlug as string) || "";
  const {
    data: thisProduct,
    isLoading,
    isSuccess,
    isError,
    error: productError
  } = useProduct(productSlug);

  const defaultVariantData =
    thisProduct?.data?.relationships?.default_variant?.data;
  const defaultVariantId = Array.isArray(defaultVariantData)
    ? defaultVariantData[0]?.id || ""
    : defaultVariantData?.id || "";
  const { data: favoriteCheck } = useCheckFavorite(defaultVariantId, !!user);
  const toggleFavorite = useToggleFavorite();
  const productImgs =
    thisProduct &&
    thisProduct?.included?.filter((e: any) => e["type"] === "image");
  const productOptions =
    thisProduct &&
    thisProduct?.included?.filter((e: any) => e["type"] === "option_value");

  // Get variant-specific colors only
  const variantIds = Array.isArray(
    thisProduct?.data?.relationships?.variants?.data
  )
    ? thisProduct?.data?.relationships?.variants?.data.map((v: any) => v.id)
    : [];
  const productVariants = thisProduct?.included?.filter(
    (item: any) => item.type === "variant" && variantIds?.includes(item.id)
  );
  const variantOptionValueIds =
    productVariants?.flatMap(
      (variant: any) =>
        variant.relationships?.option_values?.data?.map((ov: any) => ov.id) ||
        []
    ) || [];
  const productColors =
    productOptions?.filter(
      (opt: any) =>
        variantOptionValueIds.includes(opt.id) &&
        opt.attributes.presentation.includes("#")
    ) || [];

  const productSizes =
    productOptions &&
    productOptions?.filter((e: any) =>
      ["XS", "S", "M", "L", "XL"].some((size) =>
        e.attributes.presentation.includes(size)
      )
    );
  const productProperties =
    thisProduct &&
    thisProduct?.included?.filter((e: any) => e["type"] === "product_property");
  const thisProductId = thisProduct?.data?.id || "";

  // Extract taxon name from current product for "similar" filtering
  const currentTaxon = thisProduct?.included?.find(
    (item: any) => item.type === "taxon"
  )?.attributes?.name;

  // Fetch similar products by same taxon (falls back to latest if no taxon)
  const { data: similarData, isLoading: similarLoading } = useProductFeed(
    "similar",
    currentTaxon ? { filter: { taxons: currentTaxon } } : {}
  );

  // Fetch recommended products (generic latest, distinct from similar)
  const { data: recommendedData, isLoading: recommendedLoading } =
    useProductFeed("latest");

  // Legacy products query for arrow key navigation
  const {
    data: productsData,
    isLoading: productsAreLoading,
    isSuccess: productsAreSuccess
  } = useProducts(1);
  const randomNextProductId = productsAreSuccess
    ? productsData?.data[Math.floor(Math.random() * productsData?.data?.length)]
        .id
    : "";

  // Track recently viewed products
  const currentSlug = thisProduct?.data?.attributes?.slug;
  const { addProduct: trackView } = useRecentlyViewed(currentSlug);

  const {
    error: variantsError,
    status: variantsStatus,
    data: variantsData,
    isLoading: variantsAreLoading,
    isSuccess: variantsAreSuccess
  } = useVariants(1, thisProductId);

  const queryClient = useQueryClient();
  const [packSizeQtys, setPackSizeQtys] = useState([
    { name: "XS", qty: 2 },
    { name: "S", qty: 2 },
    { name: "M", qty: 2 },
    { name: "L", qty: 2 },
    { name: "XL", qty: 2 }
  ]);

  const foundVariants = thisProduct?.included?.filter(
    (elem) => elem.type === "variant"
  );
  const [chosenVariants, setChosenVariants] = useState<any[]>([]);
  const [chosenVariantQty, setChosenVariantQty] = useState(0);
  const [addItem, setAddItem] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const renderSimilarProducts = () => {
    if (similarLoading) return <Loading />;
    if (!similarData?.data?.length) return null;
    return (
      <ProductList
        products={similarData}
        title="Similar Products"
        layout="scroll"
        excludeProductId={thisProductId}
      />
    );
  };

  const renderRecommendedProducts = () => {
    if (recommendedLoading) return <Loading />;
    if (!recommendedData?.data?.length) return null;
    return (
      <ProductList
        products={recommendedData}
        title="Recommended For You"
        layout="scroll"
        excludeProductId={thisProductId}
      />
    );
  };

  const addToCart = useMutation(addItemToCart, {
    onSuccess: (data) => {
      console.log("[AddToCart] SUCCESS:", data);
      queryClient.invalidateQueries(QueryKeys.CART);
    },
    onError: (error: any) => {
      console.error("[AddToCart] ERROR:", error?.message || error);
    }
  });

  const handleKeyPress = (event: KeyboardEvent) => {
    const thisProductId = thisProduct?.data?.id;
    const productId: number = parseInt(`${thisProductId}`);
    const { key } = event;

    switch (key) {
      case "ArrowLeft":
        const prevProductId = productId - 1;
        if (randomNextProductId) {
          fetchProduct(`${prevProductId}`)
            .then((nextProduct) => {
              router.push(`/${nextProduct?.data?.attributes?.slug}`);
            })
            .catch(() => {
              fetchProduct(randomNextProductId).then((nextProduct) => {
                router.push(`/${nextProduct?.data?.attributes?.slug}`);
              });
            });
        }
        break;
      case "ArrowRight":
        const nextProductId = productId + 1;
        if (randomNextProductId) {
          fetchProduct(`${nextProductId}`)
            .then((nextProduct) => {
              router.push(`/${nextProduct?.data?.attributes?.slug}`);
            })
            .catch(() => {
              fetchProduct(randomNextProductId).then((nextProduct) => {
                router.push(`/${nextProduct?.data?.attributes?.slug}`);
              });
            });
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setAddItem({
      variant_id: foundVariants ? foundVariants[0].id : "",
      quantity: 1
    });
    if (constants.IS_DEBUG) {
      const foundVariants = thisProduct?.included?.filter(
        (elem) => elem.type === "variant"
      );
      console.log("VARIANTS: ", foundVariants);
      console.log("PRODUCT ID: ", thisProduct?.data?.id);
    }
  }, [thisProduct]);

  const handleAddToCart = (i: any) => {
    console.log("ITEM: ", i);
    addToCart.mutate(i);
  };

  const handleToggleFavorite = () => {
    if (!user) {
      const redirectUrl = encodeURIComponent(router.asPath);
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }
    if (defaultVariantId) {
      toggleFavorite.mutate(defaultVariantId);
    }
  };

  useEffect(() => {
    if (isSuccess && thisProduct?.data) {
      tracking.trackEvent({
        action: tracking.Action.VIEW_PRODUCT,
        category: tracking.Category.PRODUCT_DETAIL,
        label: thisProduct?.data?.attributes?.name
      });

      // Track this product as recently viewed
      const firstImg = productImgs?.[0];
      const imgUrl = firstImg?.attributes?.styles?.filter(
        (e: any) => e["width"] == "600"
      )[0]?.url;
      trackView({
        slug: thisProduct.data.attributes.slug,
        name: thisProduct.data.attributes.name,
        imgSrc: imgUrl
          ? `${process.env.NEXT_PUBLIC_SPREE_API_URL}${imgUrl}`
          : ""
      });
    }
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isSuccess, handleKeyPress]);

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (isError || !thisProduct) {
    return <FourOhFour />;
  }

  if (isSuccess) {
    const isFavorited = favoriteCheck?.is_favorited;

    return (
      <Layout>
        <Head>
          <title>
            {thisProduct?.data.attributes.name} -{" "}
            {process.env.NEXT_PUBLIC_SITE_TITLE}
          </title>
        </Head>

        {/* Dark gradient page wrapper */}
        <div
          className="min-h-screen"
          style={{
            background:
              "linear-gradient(180deg, #0A0020 0%, #0D0030 40%, #0A0020 100%)"
          }}
        >
          <div className="section-container py-10 md:py-16">
            {/* Product Layout */}
            <div className="flex flex-col gap-8 md:flex-row md:gap-12">
              {/* Image Carousel with neon glow backdrop */}
              <motion.div
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div
                  className="relative rounded-2xl p-1"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(0, 255, 255, 0.1) 0%, transparent 70%)"
                  }}
                >
                  <Carousel className="w-full">
                    <CarouselContent>
                      {productImgs && productImgs.length > 0 ? (
                        productImgs.map((image: any, index: number) => {
                          const imgUrl = image.attributes.styles?.filter(
                            (e: any) => e["width"] == "600"
                          )[0]?.url;
                          const imgSrc = `${process.env.NEXT_PUBLIC_SPREE_API_URL}${imgUrl}`;
                          return (
                            <CarouselItem key={`image-${index}`}>
                              <div className="aspect-square overflow-hidden rounded-xl bg-surface-deep">
                                <img
                                  src={imgSrc}
                                  alt={`${
                                    thisProduct?.data?.attributes?.name
                                  } - Image ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </CarouselItem>
                          );
                        })
                      ) : (
                        <CarouselItem>
                          <div className="flex aspect-square items-center justify-center rounded-xl bg-surface-deep">
                            <Loading />
                          </div>
                        </CarouselItem>
                      )}
                    </CarouselContent>
                    {productImgs && productImgs.length > 1 && (
                      <>
                        <CarouselPrevious className="left-3" />
                        <CarouselNext className="right-3" />
                      </>
                    )}
                  </Carousel>
                </div>
              </motion.div>

              {/* Product Info — Glass Panel */}
              <motion.div
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              >
                <div className="glass-panel p-6 md:p-8">
                  {/* Product Name */}
                  <h2 className="font-pressstart text-lg leading-relaxed text-white md:text-xl">
                    {thisProduct?.data?.attributes?.name}
                  </h2>

                  {/* Pre-order badge (if applicable) */}
                  {thisProduct?.data?.attributes?.available_on &&
                    new Date(thisProduct.data.attributes.available_on) >
                      new Date() && (
                      <span className="badge-preorder mt-3 inline-block">
                        PRE-ORDER
                      </span>
                    )}

                  {/* Favorite Button */}
                  <button
                    onClick={handleToggleFavorite}
                    className={cn(
                      "mt-4 flex items-center gap-2 rounded-lg border px-5 py-2.5 font-mono text-sm transition-all hover:-translate-y-px active:translate-y-0",
                      isFavorited
                        ? "neon-border-magenta bg-neon-magenta/10 text-neon-magenta"
                        : "border-glass-border bg-transparent text-white/70 hover:border-neon-cyan/50 hover:text-neon-cyan"
                    )}
                  >
                    <Heart
                      className={cn("h-4 w-4", isFavorited && "fill-current")}
                    />
                    {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                  </button>

                  {/* Color Swatches */}
                  {productColors && productColors.length > 0 && (
                    <div className="mt-6">
                      <span className="font-mono text-xs uppercase tracking-wider text-white/50">
                        Color
                      </span>
                      <div className="mt-2 flex items-center gap-3">
                        {productColors.map((option: any, index: number) => (
                          <button
                            key={`variant-${index}`}
                            onClick={() => setSelectedColor(option.id)}
                            className={cn(
                              "h-8 w-8 rounded-full border-2 transition-all duration-300",
                              selectedColor === option.id
                                ? "scale-110 border-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                                : "border-glass-border hover:border-white/40"
                            )}
                            style={{
                              backgroundColor: option.attributes.presentation
                            }}
                            aria-label={option.attributes.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="mt-6 font-mono text-sm leading-relaxed text-white/60">
                    {thisProduct?.data?.attributes?.description}
                  </p>

                  <hr className="my-6 border-glass-border" />

                  {/* Price */}
                  <div className="text-2xl font-bold text-neon-cyan">
                    ${thisProduct?.data?.attributes?.price}
                  </div>

                  {/* Color Select dropdown */}
                  {productColors && productColors.length > 0 && (
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="neon-focus mt-4 w-full cursor-pointer rounded-lg border border-glass-border bg-surface-deep px-4 py-3 font-mono text-sm text-white transition-colors"
                    >
                      <option value="">Color</option>
                      {productColors.map((color: any, index: number) => (
                        <option key={`color-${index}`} value={color.id}>
                          {color.attributes.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Size Selection — glass pill buttons */}
                  {productSizes && productSizes.length > 0 && (
                    <div className="mt-4">
                      <span className="font-mono text-xs uppercase tracking-wider text-white/50">
                        Size
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {productSizes.map((size: any, index: number) => (
                          <button
                            key={`size-${index}`}
                            onClick={() =>
                              setSelectedSize(size.attributes.presentation)
                            }
                            className={cn(
                              "rounded-lg border px-5 py-2.5 font-mono text-sm transition-all duration-300",
                              selectedSize === size.attributes.presentation
                                ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.25)]"
                                : "border-glass-border bg-glass-bg text-white/70 hover:border-neon-cyan/40 hover:text-white"
                            )}
                          >
                            {size.attributes.presentation}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity selector */}
                  <div className="mt-4">
                    <span className="font-mono text-xs uppercase tracking-wider text-white/50">
                      Qty
                    </span>
                    <div className="glass-panel mt-2 flex w-32 items-center overflow-hidden">
                      <button
                        onClick={() =>
                          setAddItem((prev: any) =>
                            prev
                              ? {
                                  ...prev,
                                  quantity: Math.max(
                                    1,
                                    (prev.quantity || 1) - 1
                                  )
                                }
                              : prev
                          )
                        }
                        className="px-3 py-2 font-mono text-white/70 transition-colors hover:text-neon-cyan"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-mono text-sm text-white">
                        {addItem?.quantity || 1}
                      </span>
                      <button
                        onClick={() =>
                          setAddItem((prev: any) =>
                            prev
                              ? {
                                  ...prev,
                                  quantity: (prev.quantity || 1) + 1
                                }
                              : prev
                          )
                        }
                        className="px-3 py-2 font-mono text-white/70 transition-colors hover:text-neon-cyan"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* ADD TO CART — neon button */}
                  <button
                    onClick={() => handleAddToCart(addItem)}
                    className="neon-btn mt-6 w-full text-center"
                  >
                    ADD TO CART
                  </button>
                </div>

                {/* Product Properties / Specs — Glass Panel */}
                {productProperties && productProperties.length > 0 && (
                  <motion.div
                    className="glass-panel mt-6 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                  >
                    <h3 className="mb-4 font-pressstart text-xs uppercase tracking-wider text-neon-cyan">
                      Specs
                    </h3>
                    <div className="divide-y divide-glass-border">
                      {productProperties.map((property: any, index: number) => (
                        <div
                          key={`property-${index}`}
                          className={cn(
                            "flex justify-between gap-4 px-2 py-2.5 font-mono text-sm",
                            index % 2 === 0
                              ? "bg-white/[0.02]"
                              : "bg-transparent"
                          )}
                        >
                          <span className="text-white/50">
                            {property.attributes.name}
                          </span>
                          <span className="text-right text-white">
                            {property.attributes.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Related / Recommended / Recently Viewed */}
            <motion.div
              className="mt-16 space-y-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              {renderSimilarProducts()}
              {renderRecommendedProducts()}
              <RecentlyViewed excludeSlug={currentSlug} />
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return <Loading />;
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["streams", 1], () => fetchStreams(1));
  await queryClient.prefetchQuery(["products", 1], () => fetchProducts(1));

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

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

interface WholesaleProductDetailsProps {
  wholesale?: boolean;
  [key: string]: any;
}

export const WholesaleProductDetails = ({
  props
}: WholesaleProductDetailsProps) => {
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { user } = useAuth();
  const { asPath: productSlug } = router;
  const {
    data: thisProduct,
    isLoading,
    isSuccess,
    isError,
    error: productError
  } = useProduct(`${productSlug.toLowerCase().replace("/", "")}`);

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

  // Fetch similar products by same taxon
  const { data: similarData, isLoading: similarLoading } = useProductFeed(
    "similar",
    currentTaxon ? { filter: { taxons: currentTaxon } } : {}
  );

  // Fetch recommended products (generic latest)
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

  const variantsPerPack = (sizes: any) => {
    let qty: number = 0;
    sizes.map((i: any) => {
      qty += i.qty;
    });
    return qty;
  };

  const foundVariants = thisProduct?.included?.filter(
    (elem) => elem.type === "variant"
  );
  const [chosenVariants, setChosenVariants] = useState<any[]>([]);
  const [chosenVariantQty, setChosenVariantQty] = useState(0);
  const [addItem, setAddItem] = useState<any>(null);

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
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
    },
    onError: (error) => {
      console.error("Error adding item to cart: ", error);
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
      quantity: variantsPerPack(packSizeQtys)
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
    console.log("ADDING ITEM: ", i);
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
            <div className="flex flex-col gap-8 md:flex-row md:gap-12">
              {/* Image Carousel with neon glow backdrop */}
              <motion.div
                className="w-full md:w-2/5"
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
                className="w-full md:w-3/5"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              >
                <div className="glass-panel p-6 text-center md:p-8">
                  {/* Product Name */}
                  <h2 className="font-pressstart text-lg leading-relaxed text-white md:text-xl">
                    {thisProduct?.data?.attributes?.name}
                  </h2>

                  {/* Favorite Button */}
                  <button
                    onClick={handleToggleFavorite}
                    className={cn(
                      "mx-auto mt-4 flex items-center gap-2 rounded-lg border px-5 py-2.5 font-mono text-sm transition-all hover:-translate-y-px active:translate-y-0",
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
                    <div className="mt-6 flex items-center justify-center gap-3">
                      {productColors.map((option: any, index: number) => (
                        <div
                          key={`variant-${index}`}
                          className="h-[30px] w-[30px] rounded border border-glass-border"
                          style={{
                            backgroundColor: option.attributes.presentation
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <p className="mt-4 font-mono text-sm leading-relaxed text-white/60">
                    {thisProduct?.data?.attributes?.description}
                  </p>

                  <hr className="my-6 border-glass-border" />

                  <p className="font-mono text-xs uppercase tracking-wider text-white/50">
                    Price Per Pack
                  </p>
                  <div className="mt-1 text-2xl font-bold text-neon-cyan">
                    ${thisProduct?.data?.attributes?.price}
                  </div>

                  {/* Sizes Per Pack */}
                  {productSizes && productSizes.length > 0 && (
                    <>
                      <p className="mt-4 text-left font-mono text-xs uppercase tracking-wider text-white/50">
                        Sizes Per Pack
                      </p>
                      <div className="mt-1 grid grid-cols-5">
                        {productSizes.map((i: any, index: number) => (
                          <div
                            key={`size-${index}`}
                            className="grid grid-cols-2 items-center border border-glass-border"
                          >
                            <div className="border-r border-glass-border p-1 text-center font-mono text-sm text-white/70">
                              2
                            </div>
                            <div className="bg-white/[0.03] p-1 text-center font-mono text-sm uppercase text-white">
                              {i.attributes.presentation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Wholesale Colors Table */}
                  {productColors && productColors.length > 0 && (
                    <div className="my-8">
                      {/* Table Head */}
                      <div
                        className="grid grid-cols-[30%_25%_20%_20%] rounded-t-lg font-mono text-xs font-semibold uppercase tracking-wider text-neon-cyan"
                        style={{
                          background: "rgba(0, 255, 255, 0.08)",
                          borderBottom: "1px solid rgba(0, 255, 255, 0.2)"
                        }}
                      >
                        <div className="flex items-center justify-center p-2">
                          Colors
                        </div>
                        <div className="flex items-center justify-center p-2">
                          Pack Qty
                        </div>
                        <div className="flex items-center justify-center p-2">
                          Pieces Qty
                        </div>
                        <div className="flex items-center justify-center p-2">
                          Pack Price
                        </div>
                      </div>
                      {/* Table Body */}
                      <div className="border-x border-b border-glass-border">
                        {variantsAreLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loading />
                          </div>
                        ) : (
                          productColors.map((item: any, index: number) => (
                            <div
                              key={`${index}-row`}
                              className={cn(
                                "grid grid-cols-[30%_5%_15%_5%_20%_25%] items-center",
                                index % 2 === 0
                                  ? "bg-white/[0.02]"
                                  : "bg-transparent"
                              )}
                            >
                              <div className="flex items-center justify-center p-1">
                                <div
                                  className="h-[30px] w-[30px] rounded border border-glass-border"
                                  style={{
                                    backgroundColor:
                                      item.attributes.presentation
                                  }}
                                />
                              </div>
                              <div className="flex items-center justify-center p-1">
                                <button className="rounded border border-glass-border px-2 py-1 font-mono text-sm text-white/70 transition-colors hover:border-neon-cyan/50 hover:text-neon-cyan">
                                  -
                                </button>
                              </div>
                              <div className="flex items-center justify-center p-1">
                                <input
                                  value={chosenVariantQty}
                                  type="number"
                                  min="0"
                                  max="999"
                                  onChange={(e) =>
                                    setChosenVariantQty(Number(e.target.value))
                                  }
                                  className="neon-focus w-16 rounded border border-glass-border bg-surface-deep p-1 text-center font-mono text-sm text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                              </div>
                              <div className="flex items-center justify-center p-1">
                                <button
                                  onClick={() =>
                                    setChosenVariantQty(chosenVariantQty + 1)
                                  }
                                  className="rounded border border-glass-border px-2 py-1 font-mono text-sm text-white/70 transition-colors hover:border-neon-cyan/50 hover:text-neon-cyan"
                                >
                                  +
                                </button>
                              </div>
                              <div className="flex items-center justify-center p-1 font-mono text-sm text-white/70">
                                {chosenVariantQty}
                              </div>
                              <div className="flex items-center justify-center p-1 font-mono text-sm text-neon-cyan">
                                ${item.attributes.price}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* ADD TO CART — neon button */}
                  <button
                    onClick={() => handleAddToCart(addItem)}
                    className="neon-btn w-full text-center"
                  >
                    ADD TO CART
                  </button>

                  {/* Product Properties */}
                  {productProperties && productProperties.length > 0 && (
                    <div className="mt-8 text-left">
                      <h3 className="mb-4 font-pressstart text-xs uppercase tracking-wider text-neon-cyan">
                        Specs
                      </h3>
                      <div className="divide-y divide-glass-border">
                        {productProperties.map(
                          (property: any, index: number) => (
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
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
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

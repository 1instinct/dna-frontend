import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { Heart } from "lucide-react";
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
  const {
    data: similarData,
    isLoading: similarLoading
  } = useProductFeed("similar", currentTaxon ? { filter: { taxons: currentTaxon } } : {});

  // Fetch recommended products (generic latest, distinct from similar)
  const {
    data: recommendedData,
    isLoading: recommendedLoading
  } = useProductFeed("latest");

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
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
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

        <div className="section-container py-8">
          {/* Product Layout */}
          <div className="flex flex-col gap-8 md:flex-row md:gap-12">
            {/* Image Carousel */}
            <div className="w-full md:w-1/2">
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
                          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
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
                      <div className="flex aspect-square items-center justify-center rounded-xl bg-muted">
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

            {/* Product Info */}
            <div className="w-full md:w-1/2">
              <div className="max-w-lg">
                <h2 className="font-title text-2xl font-semibold text-foreground md:text-3xl">
                  {thisProduct?.data?.attributes?.name}
                </h2>

                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  className={cn(
                    "mt-4 flex items-center gap-2 rounded-lg border px-5 py-2.5 font-body text-sm transition-all hover:-translate-y-px active:translate-y-0",
                    isFavorited
                      ? "border-brand bg-brand text-white hover:bg-brand/90"
                      : "border-border bg-transparent text-foreground hover:border-brand hover:text-brand"
                  )}
                >
                  <Heart
                    className={cn("h-4 w-4", isFavorited && "fill-current")}
                  />
                  {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                </button>

                {/* Color Swatches */}
                {productColors && productColors.length > 0 && (
                  <div className="mt-6 flex items-center gap-2">
                    {productColors.map((option: any, index: number) => (
                      <button
                        key={`variant-${index}`}
                        onClick={() => setSelectedColor(option.id)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-all",
                          selectedColor === option.id
                            ? "border-brand scale-110"
                            : "border-border hover:border-foreground"
                        )}
                        style={{
                          backgroundColor: option.attributes.presentation
                        }}
                        aria-label={option.attributes.name}
                      />
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="mt-6 font-body text-sm leading-relaxed text-muted-foreground">
                  {thisProduct?.data?.attributes?.description}
                </p>

                <hr className="my-6 border-border/30" />

                {/* Price */}
                <div className="font-title text-3xl font-bold text-foreground">
                  ${thisProduct?.data?.attributes?.price}
                </div>

                {/* Color Select */}
                {productColors && productColors.length > 0 && (
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="mt-4 w-full cursor-pointer rounded-lg border border-border bg-background px-4 py-3 font-body text-sm text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="">Color</option>
                    {productColors.map((color: any, index: number) => (
                      <option key={`color-${index}`} value={color.id}>
                        {color.attributes.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Size Selection */}
                {productSizes && productSizes.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {productSizes.map((size: any, index: number) => (
                      <button
                        key={`size-${index}`}
                        onClick={() =>
                          setSelectedSize(size.attributes.presentation)
                        }
                        className={cn(
                          "rounded-lg border px-5 py-2.5 font-title text-sm transition-all",
                          selectedSize === size.attributes.presentation
                            ? "border-brand bg-brand text-white"
                            : "border-border bg-transparent text-foreground hover:border-brand"
                        )}
                      >
                        {size.attributes.presentation}
                      </button>
                    ))}
                  </div>
                )}

                {/* Add to Cart */}
                <button
                  onClick={() => handleAddToCart(addItem)}
                  className="mt-6 w-full rounded-xl bg-brand px-8 py-4 font-title text-base font-semibold uppercase tracking-wider text-white transition-all hover:bg-brand/90 hover:-translate-y-px hover:shadow-lg active:translate-y-0"
                >
                  Add to Cart
                </button>

                {/* Product Properties */}
                {productProperties && productProperties.length > 0 && (
                  <div className="mt-8 text-left">
                    <h3 className="mb-3 font-title text-base font-semibold text-foreground">
                      Product Info
                    </h3>
                    <div className="space-y-1.5">
                      {productProperties.map((property: any, index: number) => (
                        <div
                          key={`property-${index}`}
                          className="font-body text-sm text-muted-foreground"
                        >
                          <span className="font-medium text-foreground">
                            {property.attributes.name}
                          </span>
                          : {property.attributes.value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar / Recommended / Recently Viewed */}
          <div className="mt-12 space-y-8">
            {renderSimilarProducts()}
            {renderRecommendedProducts()}
            <RecentlyViewed excludeSlug={currentSlug} />
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

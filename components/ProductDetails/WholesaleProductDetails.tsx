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
  const {
    error: productsError,
    status: productsStatus,
    data: productsData,
    isLoading: productsAreLoading,
    isSuccess: productsAreSuccess
  } = useProducts(1);
  const randomNextProductId = productsAreSuccess
    ? productsData?.data[Math.floor(Math.random() * productsData?.data?.length)]
        .id
    : "";

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
    if (productsAreLoading) return <Loading />;
    return (
      !isMobile && (
        <ProductList products={productsData} title={"Similar Products"} />
      )
    );
  };

  const recommendedProducts = () => {
    if (productsAreLoading) return <Loading />;
    return (
      !isMobile && (
        <ProductList products={productsData} title={"Recommended For You"} />
      )
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
    if (isSuccess) {
      tracking.trackEvent({
        action: tracking.Action.VIEW_PRODUCT,
        category: tracking.Category.PRODUCT_DETAIL,
        label: thisProduct?.data?.attributes?.name
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
          <div className="flex flex-col gap-8 md:flex-row md:gap-12">
            {/* Image Carousel */}
            <div className="w-full md:w-2/5">
              <Carousel className="w-full">
                <CarouselContent>
                  {productImgs && productImgs.length > 0 ? (
                    productImgs.map((image: any, index: number) => {
                      const imgUrl = image.attributes.styles[9]?.url;
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
            <div className="w-full md:w-3/5">
              <div className="max-w-lg text-center text-foreground">
                <h2 className="font-title text-2xl font-semibold md:text-3xl">
                  {thisProduct?.data?.attributes?.name}
                </h2>

                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  className={cn(
                    "mx-auto mt-4 flex items-center gap-2 rounded-lg border px-5 py-2.5 font-body text-sm transition-all hover:-translate-y-px active:translate-y-0",
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
                  <div className="mt-6 flex items-center justify-center gap-2.5">
                    {productColors.map((option: any, index: number) => (
                      <div
                        key={`variant-${index}`}
                        className="h-[30px] w-[30px] border border-border"
                        style={{
                          backgroundColor: option.attributes.presentation
                        }}
                      />
                    ))}
                  </div>
                )}

                <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
                  {thisProduct?.data?.attributes?.description}
                </p>

                <hr className="my-6 border-border/30" />

                <p className="font-body text-sm text-muted-foreground">
                  Price Per Pack
                </p>
                <div className="font-title text-3xl font-bold">
                  ${thisProduct?.data?.attributes?.price}
                </div>

                {/* Sizes Per Pack */}
                {productSizes && productSizes.length > 0 && (
                  <>
                    <p className="mt-4 text-left font-body text-sm text-muted-foreground">
                      Sizes Per Pack
                    </p>
                    <div className="grid grid-cols-5">
                      {productSizes.map((i: any, index: number) => (
                        <div
                          key={`size-${index}`}
                          className="grid grid-cols-2 items-center border border-border"
                        >
                          <div className="border-r border-border p-1 text-center text-sm">
                            2
                          </div>
                          <div className="bg-muted p-1 text-center text-sm uppercase">
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
                    <div className="grid grid-cols-[30%_25%_20%_20%] rounded-t-lg bg-brand text-sm font-semibold text-white">
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
                    <div className="border-x border-b border-border">
                      {variantsAreLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loading />
                        </div>
                      ) : (
                        productColors.map((item: any, index: number) => (
                          <div
                            key={`${index}-row`}
                            className="grid grid-cols-[30%_5%_15%_5%_20%_25%] items-center"
                          >
                            <div className="flex items-center justify-center p-1">
                              <div
                                className="h-[30px] w-[30px] border border-border"
                                style={{
                                  backgroundColor: item.attributes.presentation
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-center p-1">
                              <button className="rounded border border-border px-2 py-1 text-sm hover:bg-muted">
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
                                className="w-16 border border-border bg-transparent p-1 text-center text-sm text-foreground focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="flex items-center justify-center p-1">
                              <button
                                onClick={() =>
                                  setChosenVariantQty(chosenVariantQty + 1)
                                }
                                className="rounded border border-border px-2 py-1 text-sm hover:bg-muted"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex items-center justify-center p-1 text-sm">
                              {chosenVariantQty}
                            </div>
                            <div className="flex items-center justify-center p-1 text-sm">
                              ${item.attributes.price}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Add to Cart */}
                <button
                  onClick={() => handleAddToCart(addItem)}
                  className="w-full rounded-xl bg-brand px-8 py-4 font-title text-base font-semibold uppercase tracking-wider text-white transition-all hover:bg-brand/90 hover:-translate-y-px hover:shadow-lg active:translate-y-0"
                >
                  Add to Cart
                </button>

                {/* Product Properties */}
                {productProperties && productProperties.length > 0 && (
                  <div className="mt-8 text-left">
                    <h3 className="mb-3 font-title text-base font-semibold">
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

          {/* Similar / Recommended */}
          <div className="mt-12 space-y-8">
            {renderSimilarProducts()}
            {recommendedProducts()}
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

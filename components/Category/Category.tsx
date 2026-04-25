import * as React from "react";
import { useRouter } from "next/router";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import {
  fetchStreams,
  fetchProducts,
  useProducts,
  useStreams
} from "../../hooks";
import { Layout } from "../Layout";
import { useProduct, fetchProduct } from "../../hooks/useProduct";
import { useMutation, useQueryClient } from "react-query";
import { addItemToCart } from "../../hooks/useCart";
import { QueryKeys } from "../../hooks/queryKeys";
import * as tracking from "../../config/tracking";
import Featured from "../Home/Featured";
import { ProductList } from "../ProductList";
import { useMediaQuery } from "react-responsive";
import homeData from "../Home/home.json";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@components/ui";
import { Loading } from "../Loading";

export const Category = () => {
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { id } = router.query;
  const { data, isLoading, isSuccess } = useProduct(`${id}`);
  const queryClient = useQueryClient();
  const addToCart = useMutation(addItemToCart, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
    }
  });

  const {
    error: productError,
    status: productStatus,
    data: productData,
    isLoading: productsAreLoading,
    isSuccess: productIsSuccess
  }: {
    error: any;
    status: any;
    data: any;
    isLoading: boolean;
    isSuccess: boolean;
  } = useProducts(1);

  const polProductList = isMobile ? null : (
    <ProductList products={productData} title={"HOTDIGS"} />
  );
  const latestProducts = isMobile ? null : (
    <Featured data={homeData.latestProducts} title="" />
  );

  React.useEffect(() => {
    if (isSuccess) {
      const productContainer = Array.from(
        document.getElementsByClassName("product-container")
      ).shift();

      if (productContainer) {
        (productContainer as HTMLElement).focus();
      }

      tracking.trackEvent({
        action: tracking.Action.VIEW_PRODUCT,
        category: tracking.Category.PRODUCT_DETAIL,
        label: data?.data?.attributes?.name
      });
    }
  }, [`${id}`, isSuccess]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loading />
        </div>
      </Layout>
    );
  }

  if (isSuccess) {
    const variants = data?.data.relationships.variants.data;

    const handleAddToCart = () =>
      addToCart.mutate({
        variant_id: Array.isArray(variants) ? variants[0].id : "",
        quantity: 1
      });

    const handleKeyPress = (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowRight":
          let productId: number = parseInt(`${id}`);
          productId = event.key == "ArrowLeft" ? productId - 1 : productId + 1;

          fetchProduct(`${productId}`)
            .then((product) => {
              router.push(`/${product?.data?.attributes?.slug}`);
            })
            .catch(() => {
              /* product not found */
            });
          break;
      }
    };

    const imageSource =
      Array.isArray(data?.included) &&
      data?.included[0]?.attributes?.styles?.[2].url;
    const source = imageSource
      ? `${process.env.NEXT_PUBLIC_SPREE_API_URL}${imageSource}`
      : "https://via.placeholder.com/400x600";

    return (
      <Layout>
        <div
          tabIndex={-1}
          onKeyDown={handleKeyPress}
          className="product-container section-container flex flex-wrap py-8 font-title"
        >
          {/* Image Carousel */}
          <div className="w-full md:w-2/5">
            <Carousel className="w-full">
              <CarouselContent>
                {[0, 1, 2].map((index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                      <img
                        src={source}
                        alt={data?.data?.attributes?.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-3" />
              <CarouselNext className="right-3" />
            </Carousel>
          </div>

          {/* Product Info */}
          <div className="m-[2%] w-full md:w-auto">
            <div className="max-w-[400px] text-center text-foreground">
              <h2 className="font-title text-2xl font-semibold">
                {data?.data?.attributes?.name}
              </h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                {data?.data?.attributes?.description}
              </p>
              <h3 className="mt-4 font-title text-2xl font-bold">
                ${data?.data?.attributes?.price}
              </h3>

              <select className="mt-4 w-full cursor-pointer rounded-lg border border-border bg-background px-4 py-3 font-body text-sm text-foreground transition-colors focus:border-brand focus:outline-none">
                <option>Color</option>
                <option>Blue</option>
                <option>Beige</option>
                <option>Pink</option>
              </select>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["XS", "S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    className="rounded-lg border border-border px-5 py-2.5 font-title text-sm text-foreground transition-all hover:border-brand"
                  >
                    {size}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAddToCart}
                className="mt-6 w-full rounded-xl bg-brand px-8 py-4 font-title text-base font-semibold uppercase tracking-wider text-white transition-all hover:bg-brand/90 hover:-translate-y-px hover:shadow-lg active:translate-y-0"
              >
                Add to Cart
              </button>
            </div>

            <div className="mt-8 text-left">
              <h3 className="mb-2 font-title text-base font-semibold text-foreground md:text-sm md:text-center">
                Product Details
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                FABRIC : 100% POLYESTER BUST : 29&quot;LENGTH : 25 1/2&quot;
              </p>
              <h3 className="mb-2 mt-4 font-title text-base font-semibold text-foreground md:text-sm md:text-center">
                Model Info
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Model info goes here:
                <br />
                Height: 5&apos;8&apos;&apos;
                <br />
                Bust: 32
                <br />
                Waist: 24&apos;&apos;
                <br />
                Hip: 34&quot;
                <br />
                Wearing Size: XS
              </p>
            </div>
          </div>
        </div>

        <div className="section-container pb-8">
          <h3 className="mb-4 font-title text-lg text-foreground">
            You may also like:
          </h3>
          {polProductList}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-[400px] items-center justify-center font-title text-foreground">
        PRODUCT NOT FOUND
      </div>
    </Layout>
  );
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

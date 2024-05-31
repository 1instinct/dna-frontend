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
import { Layout } from "../components";
import { useProduct, fetchProduct } from "../../hooks/useProduct";
import { useMutation, useQueryClient } from "react-query";
import { addItemToCart } from "../../hooks/useCart";
import { QueryKeys } from "../../hooks/queryKeys";
import * as tracking from "../../config/tracking";
import Featured from "../Home/Featured";
import { PolProductList } from "../PolProductList";
import { useMediaQuery } from "react-responsive";
import homeData from "../Home/home.json";
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  Image,
  ImageWithZoom
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
// import ProductCard from "../components";

import {
  ProductContainer,
  ProductImageCarousel,
  ProductInfoBox,
  ProductDescription,
  Detail
} from "./Category.styles";

const settings = {
  speed: 500,
  dots: false,
  Infinite: false
};

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
    <PolProductList products={productData} title={"HOTDIGS"} />
  );
  const latestProducts = isMobile ? null : (
    <Featured data={homeData.latestProducts} title="" />
  );

  React.useEffect(() => {
    if (isSuccess) {
      // On page load, set focus on the product contaniner, because otherwise the arrow keys (left/right) won't work
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
    return <div>Loading Product...</div>;
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
      ? `http://localhost:8080${imageSource}`
      : "https://via.placeholder.com/400x600";
    // const source = "https://via.placeholder.com/400x600";

    return (
      <Layout>
        <ProductContainer
          tabIndex={-1}
          onKeyDown={handleKeyPress}
          className="product-container"
        >
          {/* <div className="slider-wrapper">
            <Slider {...settings}>
              <div className="slick-slide" key="1">
                <img className="slick-slide-image" src="https://via.placeholder.com/400x600" />
              </div>
              <div className="slick-slide" key="2">
                <img className="slick-slide-image" src={source} />
              </div>
            </Slider>
          </div> */}

          <ProductImageCarousel>
            <CarouselProvider
              naturalSlideWidth={600}
              naturalSlideHeight={600}
              totalSlides={3}
              isIntrinsicHeight
              touchEnabled
            >
              <Slider className="slider">
                <Slide index={0} style={{ height: "500px" }}>
                  <ImageWithZoom src={source} />
                </Slide>
                <Slide index={1} style={{ height: "500px" }}>
                  <ImageWithZoom src={source} />
                </Slide>
                <Slide index={2} style={{ height: "500px" }}>
                  <ImageWithZoom src={source} />
                </Slide>
              </Slider>

              <ButtonBack>Back</ButtonBack>
              <ButtonNext>Next</ButtonNext>
            </CarouselProvider>
          </ProductImageCarousel>

          <ProductInfoBox>
            <ProductDescription>
              <h2>{data?.data?.attributes?.name}</h2>
              <p>{data?.data?.attributes?.description}</p>
              <h3>${data?.data?.attributes?.price}</h3>

              <select>
                <option selected>Color</option>
                <option>Blue</option>
                <option>Beige</option>
                <option>Pink</option>
              </select>

              <div className="size-selection">
                <button className="">XS</button>
                <button className="">S</button>
                <button className="">M</button>
                <button className="">L</button>
                <button className="">XL</button>
              </div>

              <button className="">add to cart</button>
            </ProductDescription>

            <div>
              <Detail>Product Details</Detail>
              <p>FABRIC : 100% POLYESTER BUST : 29”LENGTH : 25 1/2”</p>
              <Detail>Model Info</Detail>
              <p>
                Model info goes here:
                <br />
                Height: 5'8''
                <br />
                Bust: 32
                <br />
                Waist: 24''
                <br />
                Hip: 34"
                <br />
                Wearing Size: XS
              </p>
            </div>
          </ProductInfoBox>
        </ProductContainer>

        <h3>you may also like:</h3>
        {polProductList ? polProductList : <></>}

        <style jsx>
          {`
            .slider-wrapper {
              width: 760px;
              margin: auto;
            }
            .slick-slide {
              text-align: center;
              position: relative;
            }
            .slick-slide:focus {
              outline: none;
            }
            .slick-slide-title {
              text-transform: capitalize;
            }
            .slick-slide-image {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              box-shadow: 0 13px 27px -5px hsla(240, 30.1%, 28%, 0.25),
                0 8px 16px -8px hsla(0, 0%, 0%, 0.3),
                0 -6px 16px -6px hsla(0, 0%, 0%, 0.03);
            }
            .slick-slide-label {
              color: #fff;
              padding: 10px;
              position: absolute;
              left: 0px;
              font-size: 1.5em;
              bottom: 0px;
              width: 100%;
            }
            .slick-prev:before,
            .slick-next:before {
              color: #777777;
            }
          `}
        </style>
      </Layout>
    );
  }

  return <div>PRODUCT NOT FOUND</div>;
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  // await queryClient.prefetchQuery(["posts", 1], () => fetchPosts(1));
  await queryClient.prefetchQuery(["streams", 1], () => fetchStreams(1));
  await queryClient.prefetchQuery(["products", 1], () => fetchProducts(1));

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

import * as React from "react";
import { useRouter } from "next/router";
import { Layout } from "../components";
import { useProduct } from "../hooks/useProduct";
import styled from "@emotion/styled";
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

const ProductContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ProductImageCarousel = styled.div`
  width: 40%;
  height: auto;
  @media screen and (max-width: 800px) {
    width: 100%;
  }
`;

const ProductInfoBox = styled.div`
  margin: 2%;
`;

const ProductDescription = styled.div`
  text-align: center;
  max-width: 400px;
`;

const ProductDetails = styled.h3`
  @media screen and (max-width: 800px) {
    font-size: 16px;
    text-align: center;
  }
`;

const settings = {
  speed: 500,
  dots: false,
  Infinite: false
};

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, isSuccess } = useProduct(`${id}`);

  if (isLoading) {
    return <div>Loading Product...</div>;
  }

  if (isSuccess) {
    const imageSource =
      Array.isArray(data?.included) && data?.included[0]?.attributes.styles[2].url;
    const source = imageSource
      ? `http://localhost:8080${imageSource}`
      : "https://via.placeholder.com/400x600";

    return (
      <Layout>
        <ProductContainer>
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
              touchEnabled>
              <Slider>
                <Slide index={0}>
                  <ImageWithZoom src={source} />
                </Slide>
                <Slide index={1}>
                  <ImageWithZoom src={source} />
                </Slide>
                <Slide index={2}>
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
              <ProductDetails>Product Details</ProductDetails>
              <p>FABRIC : 100% POLYESTER BUST : 29”LENGTH : 25 1/2”</p>
              <ProductDetails>Model Info</ProductDetails>
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
                0 8px 16px -8px hsla(0, 0%, 0%, 0.3), 0 -6px 16px -6px hsla(0, 0%, 0%, 0.03);
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

export default ProductDetail;

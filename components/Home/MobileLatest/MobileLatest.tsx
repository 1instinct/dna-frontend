import React from "react";
import { fetchStreams, fetchProducts, useProducts, useStreams } from "../../../hooks";
import { ProductCard } from "../..";
import {
  fetchStreams,
  fetchProducts,
  useProducts,
  useStreams
} from "../../../hooks";
import { ProductCard } from "../..";
import { Container, Grid, LatestTitle } from "./MobileLatest.styles";
export interface MobileLatestProps {
  products: any;
  title: string;
}
const MobileLatest: React.FC<MobileLatestProps> = (props) => {
  const { title, products } = props;
  return (
    <Container>
      <LatestTitle>{data.title}</LatestTitle>
      <Grid>
        {products?.data.map((item: any, index: any) => {
          const defaultImg =
            "https://static-assets.strikinglycdn.com/images/ecommerce/ecommerce-default-image.png";
          const productImg = item.relationships?.images?.data[0]?.id;
          const allImages =
            products &&
            products?.included?.filter((e: any) => e.type == "image");
          const foundImg = allImages.filter((e: any) => e["id"] == productImg);
          const imgUrl = foundImg[0]?.attributes?.styles[4]?.url;
          const imgSrc = productImg
            ? `${process.env.NEXT_PUBLIC_SPREE_API_URL}${imgUrl}`
            : defaultImg;

          let optionTypes = item.relationships?.option_types?.data;
          let productOptionIds = optionTypes.map((i: any) => i.id);
          let allOptions =
            products &&
            products?.included?.filter((e: any) => e.type == "option_value");
          let productVariantColors =
            allOptions &&
            allOptions?.filter((e: any) =>
              e.attributes.presentation.includes("#")
            );
          let foundOptions = productVariantColors.filter((i: any) => {
            // console.log("found: ", i.relationships.option_type.data.id);
            return productOptionIds.includes(
              i.relationships.option_type.data.id
            );
          });
          // console.log(item, productImg, foundImg, imgUrl);
          return (
            <ProductCard item={item} imgSrc={imgSrc} opts={foundOptions} />
          );
        })}
      </Grid>
    </Container>
  );
};
export default MobileLatest;

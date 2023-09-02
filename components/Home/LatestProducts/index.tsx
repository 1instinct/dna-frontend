import React from "react";
import {
  Container,
  ProductBtn,
  ProductImg,
  ProductItem,
  ProductsBox,
  Title
} from "./LatestProducts.styles";
export type LatestProduct = {
  img: string;
};
export interface LatestProductsProps {
  data: LatestProduct[];
  title: string;
}
const LatestProducts: React.FC<LatestProductsProps> = (props) => {
  const { data } = props;
  return (
    <Container>
      <Title>{props.title}</Title>
      <ProductsBox>
        {data.map((item, index) => (
          <ProductItem key={index}>
            <ProductImg src={item.img} />
            <ProductBtn>BUTTON</ProductBtn>
          </ProductItem>
        ))}
      </ProductsBox>
    </Container>
  );
};
export default LatestProducts;

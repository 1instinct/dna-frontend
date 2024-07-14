import styled from "@emotion/styled";

export const ProductContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const ProductImageCarousel = styled.div`
  width: 40%;
  height: auto;
  @media screen and (max-width: 800px) {
    width: 100%;
  }
`;

export const ProductInfoBox = styled.div`
  margin: 2%;
`;

export const ProductDescription = styled.div`
  text-align: center;
  max-width: 400px;
`;

export const Detail = styled.h3`
  @media screen and (max-width: 800px) {
    font-size: 16px;
    text-align: center;
  }
`;

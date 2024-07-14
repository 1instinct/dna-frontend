import React, { Fragment } from "react";
import styled from "@emotion/styled";
import Rating from "@material-ui/lab/Rating";
import { pxPC } from "../../utilities/device-sizes";
import AccountPageLayout from "./AccountPageLayout";
import data from "./mystyle.json";
const { list } = data;
const ProductList = styled.div`
  width: ${pxPC(1010)};
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: ${pxPC(26)};
  row-gap: ${pxPC(86)};
  justify-items: stretch;
`;
const ProductItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;
const ProductImg = styled.img`
  width: 100%;
  height: auto;
`;
const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
`;
const ProductFooterLeft = styled.div``;
const ProductFooterRight = styled.div``;
const ProductTitle = styled.div`
  font-size: 19px;
  line-height: 23px;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: "Bebas Neue";
  text-transform: uppercase;
  align-self: flex-start;
`;
const PriceText = styled.div`
  font-size: 19px;
  line-height: 23px;
  font-family: "Bebas Neue";
  margin-top: ${pxPC(10.96)};
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-align: right;
`;
const ProductDesc = styled.div`
  font-size: 16px;
  line-height: 19px;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: Roboto Condensed;
`;
const ProductRate = styled(Rating)`
  margin-top: ${pxPC(18)};
`;
const ThreeDot = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 7px;
`;
const Dot = styled.div`
  width: ${pxPC(12)};
  height: ${pxPC(12)};
  border-radius: 50%;
  border: 1px solid #969696;
  margin-right: ${pxPC(8)};
`;
const Dot1 = styled(Dot)`
  background: #cbc8bf;
`;
const Dot2 = styled(Dot)`
  background: #979d93;
`;
const Dot3 = styled(Dot)`
  background: #979d93;
`;
const MyStyle = () => {
  return (
    <AccountPageLayout>
      <ProductList>
        {list.map((item, index) => (
          <ProductItem key={index}>
            <ProductImg src={item.img} />
            <ProductFooter>
              <ProductFooterLeft>
                <ProductTitle>{item.title}</ProductTitle>
                <ProductDesc>{item.desc}</ProductDesc>
                <ThreeDot>
                  <Dot1 as={"span"}></Dot1>
                  <Dot2 as={"span"}></Dot2>
                  <Dot3 as={"span"}></Dot3>
                </ThreeDot>
              </ProductFooterLeft>
              <ProductFooterRight>
                <ProductRate name="simple-controlled" value={item.rate} />
                <PriceText>{item.price}</PriceText>
              </ProductFooterRight>
            </ProductFooter>
          </ProductItem>
        ))}
      </ProductList>
    </AccountPageLayout>
  );
};
export default MyStyle;

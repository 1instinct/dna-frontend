import styled from "@emotion/styled";
import Rating from "@material-ui/lab/Rating";
import { pxPC } from "../../utilities/device-sizes";
import {
  XlargeTitle,
  ProductTitle,
  DescText,
  PriceText
} from "../../styles/BaseStyles";
export const Container = styled.div`
  margin-top: ${pxPC(30)};

  & div div:first-of-type {
    margin: 0 0 0 10px;
  }
`;
export const Title = styled(XlargeTitle)`
  margin-bottom: ${pxPC(26)};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;
export const ProductBox = styled.div`
  margin-top: ${pxPC(30)};
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow-x: scroll;
  overflow-y: hidden;
`;
export const ProductItem = styled.div`
  margin-right: ${pxPC(26)};
  width: ${pxPC(319)};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;
export const ProductImgOutterBox = styled.div`
  height: ${pxPC(478)};
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;
export const ProductImg = styled.img`
  object-fit: cover;
  width: 100%;
`;
export const MyProductTitle = styled(ProductTitle)`
  margin-top: ${pxPC(3)};
`;
export const ProductDesc = styled(DescText)`
  margin-top: ${pxPC(3)};
`;
export const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
`;
export const ProductFooterLeft = styled.div``;
export const ProductFooterRight = styled.div``;
export const ProductRate = styled(Rating)`
  margin-top: ${pxPC(18)};
`;
export const Price = styled(PriceText)`
  margin-top: ${pxPC(11)};
  text-align: right;
`;
export const ThreeDot = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: ${pxPC(3)};
`;
const Dot = styled.div`
  width: ${pxPC(12)};
  height: ${pxPC(12)};
  border-radius: 50%;
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  margin-right: ${pxPC(8)};
`;
export const Dot1 = styled(Dot)`
  background: #cbc8bf;
`;
export const Dot2 = styled(Dot)`
  background: #979d93;
`;
export const Dot3 = styled(Dot)`
  background: #979d93;
`;

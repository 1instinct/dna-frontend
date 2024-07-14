import styled from "@emotion/styled";
import { pxIphone, pxPC } from "../../../utilities/device-sizes";
import Rating from "@material-ui/lab/Rating";
import { DescText, PriceText } from "../../../styles/BaseStyles";

export const Container = styled.div`
  margin-bottom: ${pxIphone(28)};
`;
export const LatestTitle = styled.div`
  text-align: center;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-size: 44px;
  height: 67px;
  font-family: "Bebas Neue";
  text-decoration: underline;
  margin-top: 19px;
  margin-bottom: 19px;
`;
export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: ${pxIphone(16.23)};
  row-gap: ${pxIphone(15)};
  justify-items: center;
  justify-content: space-between;
`;
export const ProductBox = styled.div`
  width: ${pxIphone(161)};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;
export const ProductImg = styled.img`
  width: 100%;
  height: auto;
`;
export const ProductTitleBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${pxIphone(9.26)};
  align-self: stretch;
`;
export const ProductTitle = styled.div`
  font-size: ${pxIphone(14)};
  line-height: 150%;
`;
export const ProductRate = styled(Rating)``;
export const ProductDesc = styled(DescText)`
  align-self: flex-start;
  margin-top: ${pxIphone(5.56)};
`;
export const ThreeDotWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${pxIphone(5.56)};
  align-self: stretch;
`;
export const ThreeDot = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: ${pxIphone(3)};
`;
const Dot = styled.div`
  width: ${pxIphone(6.53)};
  height: ${pxIphone(6.53)};
  border-radius: 50%;
  border: 1px solid #969696;
  margin-right: ${pxIphone(3.76)};
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
export const Price = styled(PriceText)`
  text-align: right;
`;

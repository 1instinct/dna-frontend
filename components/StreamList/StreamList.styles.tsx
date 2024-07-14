import styled from "@emotion/styled";
import { pxPC, pxIphone } from "../../utilities/device-sizes";
import {
  PriceText,
  ProductTitle,
  XlargeTitle,
  XsmallText
} from "../../styles/BaseStyles";
export const Title = styled(XlargeTitle)`
  font-family: "Bebas Neue";
  margin-bottom: ${pxPC(30)};
  font-size: 44px;
  line-height: 54px;
  @media (max-width: 375px) {
    margin-bottom: ${pxIphone(19)};
  }
`;
export const StreamListWrapper = styled.div`
  margin-top: ${pxPC(30)};
  overflow: hidden;
  @media (max-width: 375px) {
    margin-top: ${pxIphone(19)};
  }
`;
export const MySlideWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin-right: ${pxPC(14.99)};
`;
export const ProductImgOutterBox = styled.div`
  position: relative;
  width: 100%;
`;
export const ProductImg = styled.img`
  object-fit: cover;
  width: 100%;
`;
export const ProductMask = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.white.primary};
`;
export const MaskTitle = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 114px;
  height: 90px;
  margin: auto;
  font-size: 24px;
  line-height: 30px;
  font-family: "Bebas Neue";
  text-align: center;
  color: ${(p: any) => p.theme.colors.gray.medium};
  @media (max-width: 375px) {
    font-size: 19px;
    line-height: 23px;
    width: 88px;
  }
`;
export const MaskTitleChecked = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 137px;
  height: 90px;
  margin: auto;
  font-size: 24px;
  line-height: 30px;
  font-family: "Bebas Neue";
  text-align: center;
  color: #707070;
  @media (max-width: 375px) {
    font-size: 19px;
    line-height: 23px;
    width: 100px;
  }
`;
export const InfluencerBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  right: ${pxPC(7.74)};
  bottom: ${pxPC(-30)};
`;
export const InfluencerAvatar = styled.img``;
export const InfluencerName = styled(XsmallText)`
  margin-top: ${pxPC(5)};
`;
export const MyProductTitle = styled(ProductTitle)`
  font-family: Roboto Condensed;
  font-size: 10.75px;
  line-height: 13px;
  margin-top: ${pxPC(5.56)};
  align-self: flex-start;
`;
export const ProductDescBox = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: ${pxPC(31)};
  align-self: stretch;
`;
export const MyProductSubTitle = styled.div`
  font-family: Roboto Condensed;
  font-size: 8px;
  line-height: 9px;
  text-decoration: underline;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-align: center;
`;
export const MyProductSubText = styled.div`
  margin-left: ${pxPC(4)};
  font-family: Roboto Condensed;
  font-size: 8px;
  line-height: 9px;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;
export const ProductPrice = styled(PriceText)`
  font-family: Roboto Condensed;
  font-size: 7.9px;
  line-height: 9px;
  text-align: center;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin-left: auto;
`;

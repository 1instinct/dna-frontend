import styled from "@emotion/styled";
import { pxIphone, pxPC } from "../utilities/device-sizes";
export const ProductTitle = styled.div`
  font-size: ${pxPC(16)};
  line-height: ${pxPC(20)};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: "Bebas Neue";
  text-align: left;
`;
export const PriceText = styled.div`
  font-size: ${pxPC(16)};
  line-height: ${pxPC(20)};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: "Bebas Neue";
  text-align: center;
`;
export const Title = styled.div`
  font-size: ${pxPC(18)};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  line-height: ${pxPC(22)};
  text-align: center;
  font-family: "Bebas Neue";
`;
export const BigTitle = styled.div`
  font-family: "Montserrat";
  font-size: ${pxPC(24)};
  line-height: ${pxPC(30)};
  font-weight: bold;
  text-align: center;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;
export const LargeTitle = styled.div`
  font-family: "Bebas Neue";
  font-size: ${pxPC(39)};
  line-height: ${pxPC(48)};
  text-align: center;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;
export const XlargeTitle = styled.div`
  font-family: "Bebas Neue";
  font-size: ${pxPC(44)};
  line-height: ${pxPC(54)};
  text-align: center;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  @media (max-width: 375px) {
    font-size: ${pxIphone(24)};
    line-height: ${pxIphone(29)};
  }
`;
export const BtnTitle = styled.div`
  font-family: "Bebas Neue";
  font-size: ${pxPC(18)};
  line-height: ${pxPC(22)};
  color: ${(p) => p.theme.colors.white.primary};
  text-align: center;
`;
export const WhiteTitle = styled.div`
  font-size: ${pxPC(14)};
  line-height: ${pxPC(17)};
  color: ${(p) => p.theme.colors.white.primary};
`;
export const BigWhiteTitle = styled.div`
  font-family: "Montserrat";
  font-size: ${pxPC(24)};
  line-height: ${pxPC(30)};
  text-align: center;
  letter-spacing: 0.89em;
  color: ${(p) => p.theme.colors.white.primary};
  font-weight: bold;
`;
export const XsmallText = styled.div`
  font-family: "Roboto";
  font-size: ${pxPC(6)};
  line-height: ${pxPC(8)};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-align: center;
`;
export const WhiteText = styled.div`
  font-size: ${pxPC(14)};
  line-height: ${pxPC(17)};
  color: ${(p) => p.theme.colors.gray.medium};
  font-family: "Bebas Neue";
`;
export const DescText = styled.div`
  font-size: ${pxPC(16)};
  line-height: ${pxPC(19)};
  font-weight: 300;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: "Roboto";
`;
export const SubText = styled.div`
  font-size: ${pxPC(18)};
  line-height: ${pxPC(21)};
  color: ${(p) => p.theme.colors.gray.medium};
  font-family: Roboto;
`;

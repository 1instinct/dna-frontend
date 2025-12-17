import styled from "@emotion/styled";
import { pxPC } from "../../../utilities/device-sizes";
import ButtonBase from "@material-ui/core/ButtonBase";
import { XlargeTitle } from "../../../styles/BaseStyles";
import { Button } from "@components/shared";
type BannerContainerProps = {
  background: string;
};
export const BannerContainer = styled.div<BannerContainerProps>`
  background-image: url(${(p) => p.background});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  display: flex;
  justify-content: center;
  align-items: center;
  height: 450px;
  position: relative;
`;
export const BannerTitle = styled(XlargeTitle)``;
export const BannerImg = styled.img`
  object-fit: cover;
  width: 100%;
  margin-top: ${pxPC(30)};
`;

type BannerBtnProps = {
  width?: number;
};
export const BannerBtn = styled(Button)<BannerBtnProps>`
  width: 90%;
  max-width: 400px;
  /* height: ${pxPC(35)}; */
  position: absolute;
  bottom: ${pxPC(43)};
  left: 50%;
  transform: translateX(-50%);
  background-color: ${(p: any) => p.theme.colors.brand.primary};
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-size: ${pxPC(18)};
  line-height: ${pxPC(22)};
  text-align: center;
  z-index: 10;

  @media (min-width: ${(p: any) => p.theme.breakpoints.values.sm}px) {
    width: 60%;
  }

  @media (min-width: ${(p: any) => p.theme.breakpoints.values.md}px) {
    width: 50%;
  }

  @media (min-width: ${(p: any) => p.theme.breakpoints.values.lg}px) {
    width: 40%;
  }
`;

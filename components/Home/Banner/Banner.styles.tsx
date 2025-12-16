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
export const BannerBtn = styled(ButtonBase)<BannerBtnProps>`
  width: ${(p) => (p.width ? pxPC(p.width) : pxPC(228))};
  height: ${pxPC(35)};
  position: absolute !important;
  bottom: ${pxPC(43)};
  margin: auto !important;
  background-color: ${(p: any) => p.theme.colors.brand.primary} !important;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  left: 0;
  right: 0;
  font-family: "Bebas Neue";
  font-size: ${pxPC(18)};
  line-height: ${pxPC(22)};
  text-align: center;
`;

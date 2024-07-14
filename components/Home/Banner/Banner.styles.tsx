import styled from "@emotion/styled";
import { pxPC } from "../../../utilities/device-sizes";
import ButtonBase from "@material-ui/core/ButtonBase";
import { XlargeTitle } from "../../../styles/BaseStyles";
export const BannerContainer = styled.div`
  position: relative;
  margin: ${pxPC(36)} 0 -5px 0;
`;
export const BannerTitle = styled(XlargeTitle)``;
export const BannerImg = styled.img`
  object-fit: cover;
  min-width: 100%;
  margin-top: ${pxPC(30)};
`;
export const BannerBtn = styled(ButtonBase)`
  width: ${pxPC(228)};
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

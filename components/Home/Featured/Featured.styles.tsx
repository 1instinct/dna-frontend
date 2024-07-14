import styled from "@emotion/styled";
import { pxPC } from "../../../utilities/device-sizes";
import { XlargeTitle } from "../../../styles/BaseStyles";
import { ButtonBase } from "@material-ui/core";
export const FeaturedContainer = styled.div`
  margin-top: ${pxPC(30)};
`;
export const FeaturedTitle = styled(XlargeTitle)``;
export const FeaturedBox = styled.div`
  margin-top: ${pxPC(30)};
  flex-wrap: nowrap;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    margin-top: 0;
    flex-wrap: wrap;
    flex-direction: column;
  }
`;
export const FeaturedItem = styled.div`
  width: 100%;
  position: relative;
  margin-bottom: ${pxPC(20)};
  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
  }
`;
export const FeaturedImg = styled.img`
  object-fit: cover;
  width: 100%;
`;
export const FeaturedButton = styled(ButtonBase)`
  background: ${(p) => p.theme.colors.brand.primary} !important;
  /* width: ${pxPC(234)};
  height: ${pxPC(36)}; */
  width: 50%;
  position: absolute !important;
  bottom: ${pxPC(84)};
  left: 0;
  right: 0;
  margin: auto !important;
  font-family: "Bebas Neue";
  /* font-size: ${pxPC(18)};
  line-height: ${pxPC(22)}; */
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-align: center;
`;

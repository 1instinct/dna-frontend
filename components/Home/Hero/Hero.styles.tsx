import styled from "@emotion/styled";
import { LargeTitle, BtnTitle } from "../../../styles/BaseStyles";
import ButtonBase from "@material-ui/core/ButtonBase";
import { pxIphone, pxPC } from "@utilities/device-sizes";
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: left;
  height: ${pxPC(719)};
  background-image: url(/pol-hero.jpg);
  // background-position: center center;
  background-size: cover;
  position: relative;
  @media (max-width: 768px) {
    height: calc(100vh - ${pxIphone(60)});
    background-image: url("/pol-hero-mo.jpg");
  }
`;
export const HeroAction = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  text-align: left;
  left: ${pxPC(100)};
  bottom: ${pxPC(200)};
  width: 66%;
  
  @media (max-width: 768px) {
    left: auto;
    margin: 0 20px;
    bottom: ${pxIphone(100)};
    font-size: ${pxIphone(33)};
    line-height: ${pxIphone(41)};
  }
`;

export const HeroTitle = styled.h1`
  font-size: ${pxPC(33)};
  line-height: ${pxPC(41)};
  color: ${(p) => p.theme.colors.white.primary};
  font-size: ${(p) => p.theme.typography.titleXXL.fontSize};
  font-family: ${(p) => p.theme.typography.titleXXL.fontFamily};
  font-weight: ${(p) => p.theme.typography.titleXXL.fontWeight};
  line-height: ${(p) => p.theme.typography.titleXXL.lineHeight};
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  text-transform: uppercase;

  & span {
    color: ${(p) => p.theme.colors.brand.light};
  }

  @media (max-width: 768px) {
    font-size: ${pxIphone(33)};
    line-height: ${pxIphone(41)};
  }
`;

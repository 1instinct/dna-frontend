import styled from "@emotion/styled";
import { transparentize } from "polished";
import { ButtonBack, ButtonNext } from "pure-react-carousel";
import { Slider, Slide, ImageWithZoom } from "pure-react-carousel";

export const ProductImageCarousel = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
`;

export const CarouselBackground = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: ${(p: any) =>
    p.isDarkMode
      ? transparentize(0.95, p.theme.colors.black.primary)
      : transparentize(0.95, p.theme.colors.white.primary)};
`;

export const StyledSlider = styled(Slider)`
  height: 100vh;
  background: ${(p: any) =>
    p.isDarkMode
      ? transparentize(0.95, p.theme.colors.black.primary)
      : transparentize(0.95, p.theme.colors.white.primary)};
`;

export const StyledSlide = styled(Slide)`
  /* width: 60vw;
  height: 500px; */
  height: 100vh;
`;
export const StyledImageWithZoom = styled(ImageWithZoom)``;

export const CarouselNav = styled.div`
  width: 100%;
  position: fixed;
  left: 0;
  top: 50%;
  display: flex;
  justify-content: space-between;
`;

export const CarouselBackButton = styled(ButtonBack)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-left: 10px;
  opacity: 0.11;
  &:hover {
    opacity: 1;
  }
`;

export const CarouselNextButton = styled(ButtonNext)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
  opacity: 0.11;
  &:hover {
    opacity: 1;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  /* justify-content: center;
  align-items: center; */
  /* width: auto; */
  min-height: 100vh;
  background-color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.white.primary};
`;

export const Logo = styled.img`
  width: auto;
  height: 240px;

  @media screen and (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    width: 90%;
    height: auto;
  }
`;

export const LogoText = styled.div`
  font-family: ${(p: any) => p.theme.typography.titleLG.fontFamily};
  font-weight: ${(p: any) => p.theme.typography.titleLG.fontWeight};
  font-size: ${(p: any) => p.theme.typography.titleLG.fontSize};
  line-height: ${(p: any) => p.theme.typography.titleLG.lineHeight};
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin: 40px 0 20px 0;
`;

export const Text = styled.div`
  text-align: center;
  width: 425px;
  top: 400px;
  font-family: ${(p: any) => p.theme.typography.titleMD.fontFamily};
  font-weight: ${(p: any) => p.theme.typography.titleMD.fontWeight};
  font-size: ${(p: any) => p.theme.typography.titleMD.fontSize};
  line-height: ${(p: any) => p.theme.typography.titleMD.lineHeight};
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

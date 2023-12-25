import styled from "@emotion/styled";
import { transparentize } from "polished";
import { Slider, Slide, ButtonBack, ButtonNext } from "pure-react-carousel";
import { ImageWithZoom } from "pure-react-carousel";

export const VideoCarousel = styled.div`
  margin: 0 auto;
  width: 50%;
  height: auto;
  @media screen and (max-width: 800px) {
    width: 100%;
  }
`;

export const StyledSlider = styled(Slider)`
  -webkit-tap-highlight-color: transparent;
  position: relative;
  box-sizing: border-box;
  touch-action: pan-y;
  width: 100%;
`;
export const StyledSlide = styled(Slide)`
  /* width: 100% !important; */
  /* height: 500px !important; */
`;
export const StyledImageWithZoom = styled(ImageWithZoom)``;

export const CarouselNav = styled.div`
  width: 100%;
  position: absolute;
  left: 0;
  top: 40%;
  display: flex;
  justify-content: space-between;
`;

export const CarouselBackButton = styled(ButtonBack)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid ${(p: any) => p.theme.colors.brand.light};
  margin-left: 10px;
  padding: 9px;
  background: ${(p: any) => transparentize(0.33, p.theme.colors.brand.primary)};
  &:hover {
    background: ${(p: any) => p.theme.colors.brand.primary};
  }
`;

export const CarouselNextButton = styled(ButtonNext)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid ${(p: any) => p.theme.colors.brand.light};
  margin-right: 10px;
  padding: 9px;
  background: ${(p: any) => transparentize(0.33, p.theme.colors.brand.primary)};
  &:hover {
    background: ${(p: any) => p.theme.colors.brand.primary};
  }
`;

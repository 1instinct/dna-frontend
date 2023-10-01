import React from "react";
import { ImageWithZoom, CarouselProvider, Slide } from "pure-react-carousel";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import { VideoSlide } from "../VideoSlide";

import { IFeaturedVideo } from "../../typings";

import {
  VideoCarousel,
  StyledSlider,
  StyledSlide,
  StyledImageWithZoom,
  CarouselNav,
  CarouselBackButton,
  CarouselNextButton
} from "./VideoSlider.styles";
import { Loading, LoadingWrapper } from "..";

interface VideoSliderType {
  videos: IFeaturedVideo[];
}

export const VideoSlider = ({ videos }: VideoSliderType) => {
  const renderSlides = (videos: IFeaturedVideo[]) => {
    if (!videos) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      )
    } else {
      return videos.map((slide) => {
        return <VideoSlide key={slide.url} slide={slide} />;
      });
    }
  };

  return (
    <VideoCarousel>
      <CarouselProvider
        naturalSlideWidth={800}
        naturalSlideHeight={600}
        totalSlides={videos ? videos.length : 1}
        isIntrinsicHeight
        touchEnabled
        infinite={videos ? true : false}
      >
        <StyledSlider className="slider">
          {/* <Slide index={1} style={{ height: "500px" }}>
            <ImageWithZoom src={source} />
          </Slide>
          <Slide index={2} style={{ height: "500px" }}>
            <ImageWithZoom src={source} />
          </Slide> */}
          {renderSlides(videos)}
        </StyledSlider>

        <CarouselNav>
          <CarouselBackButton>
            <ArrowBack />
          </CarouselBackButton>
          <CarouselNextButton>
            <ArrowForward />
          </CarouselNextButton>
        </CarouselNav>
      </CarouselProvider>
    </VideoCarousel>
  );
};

import React from "react";
import { ImageWithZoom, CarouselProvider, Slide } from "pure-react-carousel";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import { VideoSlide } from "../VideoSlide";

import {
  VideoCarousel,
  StyledSlider,
  StyledSlide,
  StyledImageWithZoom,
  CarouselNav,
  CarouselBackButton,
  CarouselNextButton
} from "./VideoSlider.styles";

export const VideoSlider = ({ videos }) => {
  const renderSlides = (videos) => {
    if (!videos) {
      return <div>Loading...</div>;
    } else {
      return videos.map((slide) => {
        return <VideoSlide key={slide.url} slide={slide} />;
      });
    }
  };

  return (
    <VideoCarousel>
      <CarouselProvider
        naturalSlideWidth={600}
        naturalSlideHeight={600}
        // totalSlides={productImgs ? productImgs.length : 1}
        totalSlides={3}
        isIntrinsicHeight
        touchEnabled
        // infinite={productImgs ? true : false}
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

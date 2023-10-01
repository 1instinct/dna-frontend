import React from "react";

import {
  VideoSlideWrapper,
  VideoSlideBackground,
  VideoSlideInfo,
  VideoSlideTitle
} from "./VideoSlide.styles";
import { IFeaturedVideo } from "../../typings";

// Define your TypeScript interface for props
interface VideoSlideProps {
  slide: IFeaturedVideo;
}

export const VideoSlide: React.FC<VideoSlideProps> = ({ slide }) => {
  // Uncomment and use if needed
  // const cleanTitle = () => {
  //   const str = " | Galore TV";
  //   let title = slide.title;
  //   return title.includes(str) ? title.replace(str, "") : title;
  // };

  // Replace with your actual routing logic
  const vidLink = `/video/${slide.slug}`;

  return (
    <VideoSlideWrapper href={vidLink}>
      <VideoSlideBackground>
        <img src={slide.hero} alt={slide.title}></img>
      </VideoSlideBackground>
      <VideoSlideInfo>
        <VideoSlideTitle>{slide.title}</VideoSlideTitle>
      </VideoSlideInfo>
    </VideoSlideWrapper>
  );
};

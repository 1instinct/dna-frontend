import React from 'react';

import {
  VideoSlideWrapper,
  VideoSlideBackground,
  VideoSlideInfo,
  VideoSlideTitle,
} from './VideoSlide.styles';

// Define your TypeScript interface for props
interface SlideProps {
  slide: {
    slug: string;
    thumb_smdefault?: string;
    thumb_mddefault?: string;
    thumb_hqdefault?: string;
    title: string;
  };
}

export const VideoSlide: React.FC<SlideProps> = ({ slide }) => {
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

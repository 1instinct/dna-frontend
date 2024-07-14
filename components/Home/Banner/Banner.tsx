import React from "react";
import {
  BannerContainer,
  BannerTitle,
  BannerImg,
  BannerBtn
} from "./Banner.styles";
export type bannerData = {
  img: string;
};
export interface BannerProps {
  data: bannerData;
}
const Banner: React.FC<BannerProps> = (props) => {
  const { data } = props;
  return (
    <BannerContainer>
      <BannerImg src={data.img} />
      <BannerBtn>BUTTON</BannerBtn>
    </BannerContainer>
  );
};

export default Banner;

import React from "react";
import {
  FeaturedContainer,
  FeaturedButton,
  FeaturedImg,
  FeaturedItem,
  FeaturedBox,
  FeaturedTitle
} from "./Featured.styles";
export type LatestFeatured = {
  img: string;
};
export interface FeaturedProps {
  data: LatestFeatured[];
  title: string;
}
const Featured: React.FC<FeaturedProps> = (props) => {
  const { data } = props;
  return (
    <FeaturedContainer>
      <FeaturedTitle>{props.title}</FeaturedTitle>
      <FeaturedBox>
        {data.map((item, index) => (
          <FeaturedItem key={index}>
            <FeaturedImg src={item.img} />
            <FeaturedButton>BUTTON</FeaturedButton>
          </FeaturedItem>
        ))}
      </FeaturedBox>
    </FeaturedContainer>
  );
};
export default Featured;

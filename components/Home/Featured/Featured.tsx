import React from "react";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const { data } = props;
  return (
    <FeaturedContainer>
      <FeaturedTitle>{props.title}</FeaturedTitle>
      <FeaturedBox>
        {data.map((item, index) => (
          <FeaturedItem key={index}>
            <FeaturedImg src={item.img} />
            <FeaturedButton width={200} onClick={() => router.push("/about")}>Shop Now</FeaturedButton>
          </FeaturedItem>
        ))}
      </FeaturedBox>
    </FeaturedContainer>
  );
};
export default Featured;

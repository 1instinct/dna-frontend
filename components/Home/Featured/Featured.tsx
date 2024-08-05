import React from "react";
import { useRouter } from "next/router";
import {
  FeaturedContainer,
  FeaturedButton,
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
          <FeaturedItem key={index} background={item.img}>
            <FeaturedButton width={300} onClick={() => router.push("/about")}>Shop Now</FeaturedButton>
          </FeaturedItem>
        ))}
      </FeaturedBox>
    </FeaturedContainer>
  );
};
export default Featured;

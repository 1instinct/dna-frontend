import React from "react";
import { useRouter } from "next/router";
import { BannerContainer, BannerTitle, BannerBtn } from "./Banner.styles";
export type bannerData = {
  img: string;
};
export interface BannerProps {
  data: bannerData;
}
const Banner: React.FC<BannerProps> = (props) => {
  const router = useRouter();
  const { data } = props;
  return (
    <BannerContainer background={data.img}>
      <BannerBtn width={300} onClick={() => router.push("/about")}>
        SHOP NOw
      </BannerBtn>
    </BannerContainer>
  );
};

export default Banner;

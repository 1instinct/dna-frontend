import React from "react";
import { useRouter } from "next/router";
import { ShimmerButton } from "@components/ui";

export type bannerData = { img: string };
export interface BannerProps {
  data: bannerData;
}

const Banner: React.FC<BannerProps> = ({ data }) => {
  const router = useRouter();
  return (
    <div
      className="relative flex h-[350px] items-center justify-center overflow-hidden rounded-lg bg-cover bg-center sm:h-[450px]"
      style={{ backgroundImage: `url(${data.img})` }}
    >
      <ShimmerButton
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
        shimmerColor="#00ffff"
        background="rgba(0, 255, 255, 0.15)"
        onClick={() => router.push("/browse")}
      >
        SHOP NOW
      </ShimmerButton>
    </div>
  );
};
export default Banner;

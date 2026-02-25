import React from "react";
import { useRouter } from "next/router";
import { ShimmerButton } from "@components/ui";

export type LatestFeatured = { img: string };
export interface FeaturedProps {
  data: LatestFeatured[];
  title: string;
}

const Featured: React.FC<FeaturedProps> = ({ data, title }) => {
  const router = useRouter();
  return (
    <div className="my-8">
      {title && <h2 className="heading-lg mb-6">{title}</h2>}
      <div className="flex flex-col gap-4 xs:flex-row">
        {data.map((item, index) => (
          <div
            key={index}
            className="group relative flex h-[350px] w-full items-center justify-center overflow-hidden rounded-lg bg-cover bg-center sm:h-[450px]"
            style={{ backgroundImage: `url(${item.img})` }}
          >
            <div className="absolute inset-0 bg-black/10 transition-all duration-500 group-hover:bg-black/30" />
            <ShimmerButton
              className="relative z-10 opacity-0 transition-all duration-300 ease-expo-out group-hover:opacity-100 group-hover:translate-y-0 translate-y-4"
              shimmerColor="#EB8B8B"
              background="rgba(0,0,0,0.6)"
              onClick={() => router.push("/browse")}
            >
              Shop Now
            </ShimmerButton>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Featured;

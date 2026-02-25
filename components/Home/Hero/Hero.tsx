import React from "react";
import { useRouter } from "next/router";
import { AnimatedGradientText, ShimmerButton, Particles } from "@components/ui";

export interface HeroProps {}

const Hero: React.FC<HeroProps> = () => {
  const router = useRouter();
  return (
    <div className="relative flex h-[50vw] min-h-[400px] max-h-[719px] flex-col justify-end bg-cover bg-center sm:h-[50vw]"
      style={{ backgroundImage: "url(/pol-hero.jpg)" }}
    >
      <Particles
        className="absolute inset-0"
        quantity={40}
        color="#EB8B8B"
        size={0.6}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="relative z-10 px-6 pb-16 sm:px-12 md:px-24 md:pb-24 lg:w-2/3">
        <h1 className="font-title text-title-xl text-white text-shadow-lg sm:text-title-xxl">
          NEW{" "}
          <AnimatedGradientText
            colorFrom="#EB8B8B"
            colorTo="#CC8BEB"
            className="text-title-xl sm:text-title-xxl"
          >
            SPRING / SUMMER
          </AnimatedGradientText>{" "}
          LOOKS ARE HERE
        </h1>
        <ShimmerButton
          className="mt-6"
          shimmerColor="#EB8B8B"
          background="rgba(0,0,0,0.6)"
          onClick={() => router.push("/browse")}
        >
          BROWSE NOW
        </ShimmerButton>
      </div>
    </div>
  );
};
export default Hero;

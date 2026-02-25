import React from "react";
import { Layout } from "../../components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="relative flex min-h-[calc(100vh-543px)] flex-col items-center pb-[17vw] pt-[11.875vw]">
        <div className="absolute left-[3.75vw] top-[34.1vw] -rotate-90 font-title text-[33px] uppercase leading-[41px] text-foreground after:absolute after:left-full after:top-[40%] after:h-[3px] after:w-[5.97vw] after:bg-foreground after:content-['']">
          About POL
        </div>
        <div className="text-center font-title text-[33px] uppercase leading-[41px] text-foreground">
          Who we Are
        </div>
        <div className="mt-[1.39vw] w-[23.89vw] font-body text-lg leading-[18px] text-foreground">
          POL Clothing is a wholesale supplier to boutiques all over the world.
          POL focuses on coming together at the crossroads of fashion and
          business and creating styles inspired by the world around us.
        </div>
        <img
          src="/Arrow.png"
          alt=""
          className="my-[3.125vw] h-auto w-[4.31vw]"
        />
        <div className="text-center font-title text-[33px] uppercase leading-[41px] text-foreground">
          Our Mission
        </div>
        <div className="mt-[1.39vw] w-[23.89vw] font-body text-lg leading-[18px] text-foreground">
          POL Clothing is a wholesale supplier to boutiques all over the world.
          POL focuses on coming together at the crossroads of fashion and
          business and creating styles inspired by the world around us.
        </div>
        <img
          src="/Arrow.png"
          alt=""
          className="my-[3.125vw] h-auto w-[4.31vw]"
        />
        <div className="text-center font-title text-[33px] uppercase leading-[41px] text-foreground">
          Our Values
        </div>
        <div className="mt-[2.08vw] grid w-[27.36vw] grid-cols-3 gap-[1.74vw]">
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
        </div>
        <img
          src="/Arrow.png"
          alt=""
          className="my-[3.125vw] h-auto w-[4.31vw]"
        />
        <div className="text-center font-title text-[33px] uppercase leading-[41px] text-foreground">
          Our Team
        </div>
        <div className="mt-[2.08vw] grid w-[27.36vw] grid-cols-3 gap-[1.74vw]">
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
          <img src="paper.png" alt="" className="h-auto w-[7.92vw]" />
        </div>
      </div>
    </Layout>
  );
};
export default About;

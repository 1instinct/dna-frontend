// Vendor
import React, { useCallback } from "react";
import { Carousel } from "react-responsive-carousel";
import Lottie from "react-lottie";
import streamAnimation from "@data/stream.json";
import shippingAnimation from "@data/shipping.json";
import rewardAnimation from "@data/reward.json";

// Local
import TipBot from "../../TipBot";
import {
  QuestionWrapper,
  InputGroupWrapper,
  Title,
  Description
} from "./Questions.styles";

const partnerName = process.env.NEXT_PUBLIC_SITE_TITLE;
const shortName = process.env.NEXT_PUBLIC_SHORT_TITLE;

export const Welcome = () => {
  const streamAnimationOptions = {
    loop: true,
    autoplay: true,
    animationData: streamAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  const shippingAnimationOptions = {
    loop: true,
    autoplay: true,
    animationData: shippingAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  const rewardAnimationOptions = {
    loop: true,
    autoplay: true,
    animationData: rewardAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  const speechMarkup = useCallback(() => {
    return {
      __html: `Welcome to <strong>${partnerName}</strong>!<br /> Create your account so you can start browsing, saving, and getting deals!`
    };
  }, []);

  return (
    <QuestionWrapper>
      <TipBot speech={speechMarkup()} />
      <InputGroupWrapper isIntro>
        <Carousel
          autoPlay
          swipeable
          infiniteLoop
          showArrows={false}
          showStatus={false}
          showThumbs={false}
        >
          <div>
            <Title>Free Shipping</Title>
            <Description>(On your first order)</Description>
          </div>
          <div>
            <Title>Rewards</Title>
            <Description>Cash back on purchases</Description>
          </div>
          <div>
            <Title>Live-Stream Shopping</Title>
            <Description>Chat with sellers and buy in real-time</Description>
          </div>
        </Carousel>
      </InputGroupWrapper>
    </QuestionWrapper>
  );
};

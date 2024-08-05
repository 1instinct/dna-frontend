// Vendor
import React, { useCallback } from "react";
import styled from "@emotion/styled";
// import { Field, useFormikContext } from 'formik';
// import { useMediaQuery } from 'react-responsive';
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

interface GenericThemeType {
  theme?: any;
}

export const ColorizedFinance = styled.i<GenericThemeType>`
  ${"" /* transform: scale(2); */}
  & svg {
    width: 5rem;
    height: 5rem;
  }
  & svg g path:first-of-type {
    fill: ${(props) => props.theme.colors.brand.primary};
  }
`;

export const ColorizedCalendar = styled.i<GenericThemeType>`
  ${"" /* transform: scale(2); */}
  & svg {
    width: 5rem;
    height: 5rem;
  }
  & svg g path:first-of-type {
    fill: ${(props) => props.theme.colors.brand.primary};
  }
`;

export const ColorizedLoan = styled.i<GenericThemeType>`
  ${"" /* transform: scale(2); */}
  & svg {
    width: 5rem;
    height: 5rem;
  }
  & svg g path:first-of-type {
    fill: ${(props) => props.theme.colors.brand.primary};
  }
`;

export const ColorizedCart = styled.i<GenericThemeType>`
  ${"" /* transform: scale(2); */}
  & svg {
    width: 5rem;
    height: 5rem;
  }
  & svg g path:first-of-type {
    fill: ${(props) => props.theme.colors.brand.primary};
  }
`;

const partnerName = process.env.NEXT_PUBLIC_SITE_TITLE;
const shortName = process.env.NEXT_PUBLIC_SHORT_TITLE;

export const Welcome = () => {
  // const { errors, touched } = useFormikContext();

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
      <InputGroupWrapper>
        <Carousel
          autoPlay
          swipeable
          infiniteLoop
          showArrows={false}
          showStatus={false}
          showThumbs={false}
        >
          <div>
            {/* <ColorizedCalendar className="bts bt-calendar" /> */}
            <Lottie
              options={shippingAnimationOptions}
              width={200}
              height={300}
              style={{ pointerEvents: "none" }}
            />
            <Title>Free Shipping</Title>
            <Description>(On your first order)</Description>
          </div>
          <div>
            {/* <ColorizedLoan className="bts bt-folder" /> */}
            <Lottie
              options={rewardAnimationOptions}
              width={300}
              height={200}
              style={{ pointerEvents: "none" }}
            />
            <Title>Rewards</Title>
            <Description>Cash back on purchases</Description>
          </div>
          <div>
            {/* <ColorizedCart className="bts bt-shopping-cart" /> */}
            <Lottie
              options={streamAnimationOptions}
              width={300}
              height={300}
              style={{ pointerEvents: "none" }}
            />
            <Title>Live-Stream Shopping</Title>
            <Description>Chat with sellers and buy in real-time</Description>
          </div>
        </Carousel>
      </InputGroupWrapper>
    </QuestionWrapper>
  );
};

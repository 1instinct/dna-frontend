import { fadeIn, slideInRight, slideOutLeft } from "react-animations";
import { useSpring, animated } from "react-spring";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

export const fadeInKeyframes = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

export const fadeInOutKeyframes = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.25; }
  100% { opacity: 1; }
`;

export const SlideInLeftKeyframes = keyframes`
  0% { transform: translateX(-5rem); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

export const SlideOutLeftKeyframes = keyframes`
  0% { transform: translateX(0rem); opacity: 1; }
  100% { transform: translateX(-5rem); opacity: 0; }
`;

// export const slideInLeftKeyframes = keyframes`${slideInLeft}`;

// export const slideOutLeftKeyframes = keyframes`${slideOutLeft}`;

export const FadeIn = styled.div`
  animation: 0.33s ${fadeInKeyframes} ease-in-out infinite;
`;

export const FadeInOut = styled.div`
  animation: 0.33s ${fadeInOutKeyframes} linear infinite;
`;

export const SlideOutLeft = styled.div`
  animation: 0.33s ${SlideOutLeftKeyframes} cubic-bezier(0.215, 0.61, 0.355, 1);
`;

export const SlideInLeft = styled.div`
  animation: 0.33s ${SlideInLeftKeyframes} cubic-bezier(0.215, 0.61, 0.355, 1);
`;

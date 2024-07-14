import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { boolean } from "yup/lib/locale";

const fadeInOut = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.25; }
  100% { opacity: 1; }
`;

const FadeInOut = styled.div`
  animation: 0.33s ${fadeInOut} linear infinite;
`;

const width = 100;
const height = width * 0.5;

export const TipBotWrapper = styled.div`
  position: relative;
  top: -150px;
  left: 0px;
  ${"" /* width: 105%; */}
`;

export const TipBotImage = styled.div`
  position: relative;
  left: 50%;
  margin-left: -24px;
  bottom: -20px;
  background: url("/tip-bot.png") no-repeat;
  background-size: 48px 48px;
  width: 48px;
  height: 48px;

  /* iPhone 6,7,8 Portrait ------- */
  @media only screen and (min-device-width: 375px) and (max-device-height: 667px) and (orientation: portrait) {
    position: absolute;
    left: 0px;
    bottom: -130px;
  }

  /* iPhone 11 Portrait ------------ */
  @media only screen and (device-width: 414px) and (device-height: 896px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 2) {
    position: absolute;
    left: 0px;
    bottom: -130px;
  }

  /* iPhone X Portrait ----------- */
  @media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait) {
    position: absolute;
    left: 0px;
    bottom: -130px;
  }

  /* iPad Mini Portrait ------------ */
  @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: portrait) and (-webkit-min-device-pixel-ratio: 1) {
    position: absolute;
    left: 0px;
    bottom: -130px;
  }

  @media only screen and (max-width: ${(props: any) =>
      props.theme.breakpoints.values.sm}px) {
    position: absolute;
    ${
      "" /* left: 25px;
    bottom: -35px; */
    }
    left: 0px;
    bottom: -130px;
  }
`;

export const BubbleWrapper = styled.div`
  border-radius: 8px;
  /* border: 1px solid ${(props: any) => props.theme.colors.gray.medium}; */
  background: ${(props: any) =>
    props.theme.isDarkMode
      ? props.theme.colors.black.light
      : props.theme.colors.white.primary};
  margin: 0 0 -35px 0;
  padding: 15px;
  &:after {
    display: block;
    position: relative;
    left: 80px;
    bottom: -30px;
    content: " ";
    background: url("images/bubble-arrow.svg") no-repeat;
    background-size: 29px 16px;
    width: 29px;
    height: 16px;
  }
`;

interface BubbleWrapperMobileType {
  speechReady: boolean;
}

export const BubbleWrapperMobile = styled.div<BubbleWrapperMobileType>`
  transition: all 0.33s ease-in-out;
  display: flex;
  position: absolute;
  left: 68px;
  bottom: -90px;
  font-size: 0.9rem;
  padding: ${(props) => (props.speechReady ? "10px 14px" : "auto")};
  width: ${(props) => (props.speechReady ? "auto" : `${width * 0.8}px`)};
  height: ${(props) => (props.speechReady ? "auto" : `${height * 0.8}px`)};
  align-items: center;
  justify-content: space-around;
  border-radius: ${(props) => (props.speechReady ? 20 : 36)}px;
  background-color: ${(props) =>
    props.theme.isDarkMode
      ? props.theme.colors.black.light
      : props.theme.colors.white.primary};
  box-shadow: 5px 8px 20px rgba(0, 0, 0, 0.25);
  color: ${(props) =>
    props.theme.isDarkMode
      ? props.theme.colors.white.primary
      : props.theme.colors.black.primary};
  &::before,
  &::after {
    position: absolute;
    content: " ";
    background: ${(props) =>
      props.theme.isDarkMode
        ? props.theme.colors.black.light
        : props.theme.colors.white.primary};
    border-radius: 100%;
    ${"" /* box-shadow: 5px 8px 20px rgba(0,0,0,0.25); */}
  }

  &::before {
    bottom: 0;
    left: -6px;
    width: ${height / 3}px;
    height: ${height / 3}px;
  }

  &::after {
    bottom: -5px;
    left: -18px;
    width: ${height / 6}px;
    height: ${height / 6}px;
  }
`;

export const BubbleSpeech = styled.div`
  color: ${(props: any) =>
    props.theme.isDarkMode
      ? props.theme.colors.white.primary
      : props.theme.colors.black.primary};
  font-size: 1rem;
  font-weight: 300;
  text-align: left;
`;

export const BubbleDot = styled.div`
  width: ${width / 8}px;
  height: ${width / 8}px;
  border-radius: 100%;
  background-color: ${(props: any) =>
    props.theme.isDarkMode
      ? props.theme.colors.black.light
      : props.theme.colors.white.primary};

  animation: ${fadeInOut} 1.5s linear infinite;
  animation-delay: 0.25s;

  &:first-of-type {
    margin-left: ${width / 8}px;
    animation-delay: 0s;
  }

  &:last-of-type {
    margin-right: ${width / 8}px;
    animation-delay: 0.5s;
  }
`;

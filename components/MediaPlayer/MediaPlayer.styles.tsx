import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

export const StarsContainer = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: black;
`;

const spin = keyframes`
  from {
      transform: rotate(0deg)
  }
  to {
      transform: rotate(360deg)
  }
`;

export const Stars = styled.div`
  content: "";
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background: url(img/stars.png) 0 0 repeat;
  background-size: cover;
  animation: ${spin} 180s linear infinite;
`;

export const GlowContainer = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 999;
  overflow: hidden;
  pointer-events: none;
`;

/* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#2e04e8+0,660058+100&0+0,1+100 */
export const Glow = styled.div`
  background: radial-gradient(ellipse at center, rgba(46, 4, 232, 0) 0%, rgba(102, 0, 88, 1) 100%);
  display: block;
  height: 100%;
  width: 100%;
  top: 100px;
  left: 0;
  opacity: 0.66;
  transform: scale(2.2);
`;

export const Skyline = styled.div`
  z-index: 1;
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 0px;
  height: 490px;
  display: block;
  background: url(img/skyline.png) repeat-x;
  background-size: 1775px 600px;
  background-position: center -30px;
  pointer-events: none;
`;

export const Cockpit = styled.div`
  z-index: 2;
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: block;
  background: url(img/cockpit.png) no-repeat;
  background-size: 120% 120%;
  background-position: top center;

  pointer-events: none;
`;

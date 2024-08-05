import styled from "@emotion/styled";
import Link from "next/link";
import { pxPC, pxIphone } from "../../utilities/device-sizes";
import { PriceText, XlargeTitle, XsmallText } from "../../styles/BaseStyles";

export const StreamCardWrapper = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin: 10px;
`;
export const StreamImgWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  &:after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 0.66) 100%
    );
  }
`;
export const StreamImg = styled.img`
  object-fit: cover;
  width: 100%;
  height: 100%;
`;
export const StreamMask = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;
export const StreamStatusWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;
export const StreamStatus = styled.h4`
  color: ${(p) => p.theme.colors.white.primary};
  // color: ${(p) => p.theme.isDarkMode ? p.theme.colors.white.primary : p.theme.colors.black.primary};
  // background: ${(p) => p.theme.isDarkMode ? p.theme.colors.black.primary : p.theme.colors.white.primary};
  margin: 60px auto 0 auto;
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  font-size: ${(p) => p.theme.typography.titleSM.fontSize};
  text-shadow: 0px 0px 10px rgba(0, 0, 0, 0.66);
  text-align: center;
  padding: 40px;
  
  @media (max-width: 375px) {
    font-size: 19px;
    line-height: 23px;
    width: 88px;
  }
`;
export const StreamCardLink = styled(Link)``;
export const StreamChecked = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 137px;
  height: 90px;
  margin: auto;
  font-size: 0.8em;
  line-height: 30px;
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
  color: ${(p) => p.theme.isDarkMode ? p.theme.colors.white.primary : p.theme.colors.black.primary};
  background: ${(p) => p.theme.isDarkMode ? p.theme.colors.black.primary : p.theme.colors.white.primary};
  text-align: center;
  @media (max-width: 375px) {
    font-size: 19px;
    line-height: 23px;
    width: 100px;
  }
`;
export const StreamCardTitle = styled.h2`
  text-align: center;
  font-size: ${(p) => p.theme.typography.titleMD.fontSize};
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  line-height: ${(p) => p.theme.typography.titleSM.lineHeight};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin: 40px 0 0 0;
`;

export const StreamCardDesc = styled.p`
  text-align: center;
  font-size: ${(p) => p.theme.typography.bodySM.fontSize};
  font-family: ${(p) => p.theme.typography.bodySM.fontFamily};
  line-height: ${(p) => p.theme.typography.bodySM.lineHeight};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-weight: 100;
`;
export const InfluencerBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  // right: ${pxPC(7.74)};
  top: ${pxPC(170)};
`;
export const InfluencerAvatar = styled.img`
  width: ${pxPC(40)};
  height: ${pxPC(40)};
  border-radius: 50%;
  margin-bottom: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.66);
`;
export const InfluencerName = styled.span`
  font-size: ${(p) => p.theme.typography.bodyXS.fontSize};
  font-family: ${(p) => p.theme.typography.bodyXS.fontFamily};
  line-height: ${(p) => p.theme.typography.bodyXS.lineHeight};
  color: ${(p) => p.theme.isDarkMode ? p.theme.colors.white.primary : p.theme.colors.black.primary};
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
`;

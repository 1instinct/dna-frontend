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
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;
export const StreamStatus = styled.h4`
  color: ${(p) => p.theme.colors.white.primary};
  margin: 0 auto;
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
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
  text-align: center;
  @media (max-width: 375px) {
    font-size: 19px;
    line-height: 23px;
    width: 100px;
  }
`;
export const StreamCardTitle = styled.h2`
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  line-height: ${(p) => p.theme.typography.titleSM.lineHeight};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin: 20px 0 0 0;
`;

export const StreamCardDesc = styled.p`
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-align: center;
  font-weight: 100;
`;
export const InfluencerBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  right: ${pxPC(7.74)};
  bottom: ${pxPC(-30)};
`;
export const InfluencerAvatar = styled.img``;
export const InfluencerName = styled.span`
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
`;

import styled from "@emotion/styled";
import { LargeTitle, BtnTitle } from "../../../styles/BaseStyles";
import ButtonBase from "@material-ui/core/ButtonBase";
import { pxIphone, pxPC } from "../../../utilities/device-sizes";
export const Container = styled.div`
  display: flex;
  justify-content: left;
  height: ${pxPC(719)};
  background-image: url(/pol-hero.jpg);
  background-size: cover;
  position: relative;
  @media (max-width: 768px) {
    height: calc(100vh - ${pxIphone(60)});
    background-image: url("/pol-hero-mo.jpg");
  }
`;
export const HeroTitle = styled(LargeTitle)`
  display: flex;
  flex-direction: column;
  position: absolute;
  text-align: left;
  left: ${pxPC(100)};
  bottom: ${pxPC(200)};
  @media (max-width: 768px) {
    left: auto;
    margin: 0 20px;
    bottom: ${pxIphone(100)};
    font-size: ${pxIphone(33)};
    line-height: ${pxIphone(41)};
  }
`;
export const HeroBtn = styled(ButtonBase)`
  width: ${pxPC(237)};
  height: ${pxPC(37)};
  background: #eb8b8b !important;
  margin-top: ${pxPC(22)}!important;
  font-family: "Bebas Neue";
  font-size: ${pxPC(18)};
  line-height: ${pxPC(22)};
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-align: center;
  @media (max-width: 768px) {
    width: 50vw;
    height: ${pxIphone(31)};
    font-size: ${pxIphone(20)};
    line-height: ${pxIphone(24)};
    margin-top: ${pxIphone(10)}!important;
    padding: ${pxIphone(6)} ${pxIphone(20)} !important;
  }
`;

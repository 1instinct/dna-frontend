import styled from "@emotion/styled";
import { pxIphone } from "../../utilities/device-sizes";

// export const LayoutContainer = styled.main`
//   width: 100%;
//   min-height: 100vh;
//   flex: 1;
//   display: flex;
//   flex-direction: column;
//   max-height: calc(100% - 235px);
// `;
// export const Content = styled.div`
//   width: 100%;
//   flex: 1;
//   display: flex;
//   flex-direction: column;
//   overflow: hidden;
// `;

type LogoType = {
  src: string;
  darkMode: boolean;
};

export const Logo = styled.img<LogoType>`
  width: 181px;
  height: auto;
  margin-bottom: 20px;
  ${(p) => (p.darkMode ? "filter: invert(1);" : null)};
  box-shadow: 0 10px 22px rgba(255, 255, 255, 0.1);
  @media (max-width: 375px) {
    width: ${pxIphone(80)};
    margin-bottom: 14.68vw;
    height: auto;
  }
  @media (max-width: 750px) {
    margin-bottom: 0;
    margin-top: 6px;
  }
`;

export const Container = styled.main`
  flex: 1;
  overflow: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;
export const Content = styled.div`
  flex: 1;
  overflow-x: scroll;
`;

export const HorizontalList = styled.div`
  width: 100%;
  height: 100%;
  white-space: nowrap !important;
  padding: 15px 15px 20px 15px;
  position: relative;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  white-space: nowrap;
  -webkit-transform: translate3d(0, 0, 0);
  -moz-transform: translate3d(0, 0, 0);
  -ms-transform: translate3d(0, 0, 0);
  -o-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
`;

export const SeeMoreLink = styled.a`
  width: 220px;
  height: 240px;
  margin: 0 5px;
  display: inline-table !important;
  background-size: cover;
  white-space: normal !important;
  font-size: 12px;
  vertical-align: bottom;
  text-align: center;

  display: flex;
  justify-content: center;
  align-items: center;
`;

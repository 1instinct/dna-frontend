import React from "react";
import styled from "@emotion/styled";
import { pxPC } from "../../utilities/device-sizes";
import { Layout } from "../../components";

const Content = styled.div`
  min-height: calc(100vh - 543px);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: ${pxPC(171)};
  padding-bottom: ${pxPC(244.86)};
`;
const PageTitle = styled.div`
  position: absolute;
  left: ${pxPC(54)};
  top: ${pxPC(491)};
  font-size: 33px;
  line-height: 41px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-transform: uppercase;
  transform: rotate(-90deg);
  font-family: "Bebas Neue";
  &:after {
    position: absolute;
    content: "";
    left: 100%;
    width: ${pxPC(86)};
    height: 3px;
    background-color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
    top: 40%;
  }
`;
const SectionOneTitle = styled.div`
  font-size: 33px;
  line-height: 41px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: "Bebas Neue";
  text-align: center;
  text-transform: uppercase;
`;
const SectionOneText = styled.div`
  width: ${pxPC(344)};
  margin-top: ${pxPC(20)};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: Roboto;
  font-size: 18px;
  line-height: 18px;
`;
const Arrow = styled.img`
  width: ${pxPC(62)};
  height: auto;
  margin-top: ${pxPC(45)};
  margin-bottom: ${pxPC(45)};
`;
const SectionTwoTitle = styled.div`
  font-size: 33px;
  line-height: 41px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: "Bebas Neue";
  text-align: center;
  text-transform: uppercase;
`;
const SectionTwoText = styled.div`
  width: ${pxPC(344)};
  margin-top: ${pxPC(20)};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: Roboto;
  font-size: 18px;
  line-height: 18px;
`;
const SectionThreeTitle = styled.div`
  font-size: 33px;
  line-height: 41px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: "Bebas Neue";
  text-align: center;
  text-transform: uppercase;
`;
const SectionThree = styled.div`
  display: grid;
  justify-content: space-between;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: ${pxPC(25)};
  row-gap: ${pxPC(25)};
  width: ${pxPC(394)};
  margin-top: ${pxPC(30)};
`;
const SectionFourTitle = styled.div`
  font-size: 33px;
  line-height: 41px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: "Bebas Neue";
  text-align: center;
  text-transform: uppercase;
`;
const SectionFour = styled.div`
  display: grid;
  justify-content: space-between;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: ${pxPC(25)};
  row-gap: ${pxPC(25)};
  width: ${pxPC(394)};
  margin-top: ${pxPC(30)};
`;
const Paper = styled.img`
  width: ${pxPC(114)};
  height: auto;
`;
const About = () => {
  return (
    <Layout>
      <Content>
        <PageTitle>About POL</PageTitle>
        <SectionOneTitle>Who we Are</SectionOneTitle>
        <SectionOneText>
          POL Clothing is a wholesale supplier to boutiques all over the world.
          POL focuses on coming together at the crossroads of fashion and
          business and creating styles inspired by the world around us.
        </SectionOneText>
        <Arrow src={"/Arrow.png"} />
        <SectionTwoTitle>Our Mission</SectionTwoTitle>
        <SectionTwoText>
          POL Clothing is a wholesale supplier to boutiques all over the world.
          POL focuses on coming together at the crossroads of fashion and
          business and creating styles inspired by the world around us.
        </SectionTwoText>
        <Arrow src={"/Arrow.png"} />
        <SectionThreeTitle>Our Values</SectionThreeTitle>
        <SectionThree>
          <Paper src={"paper.png"} />
          <Paper src={"paper.png"} />
          <Paper src={"paper.png"} />
          <Paper src={"paper.png"} />
          <Paper src={"paper.png"} />
          <Paper src={"paper.png"} />
        </SectionThree>
        <Arrow src={"/Arrow.png"} />
        <SectionFourTitle>Our Team</SectionFourTitle>
        <SectionFour>
          <Paper src={"paper.png"} />
          <Paper src={"paper.png"} />
          <Paper src={"paper.png"} />
          <Paper src={"paper.png"} />
          <Paper src={"paper.png"} />
          <Paper src={"paper.png"} />
        </SectionFour>
      </Content>
    </Layout>
  );
};
export default About;

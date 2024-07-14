import React from "react";
import { HeroBtn, HeroTitle, Container } from "./Hero.styles";
export interface HeroProps {}
const Hero: React.FC<HeroProps> = (props) => {
  return (
    <Container>
      <HeroTitle>
        <span>BROWSE ALL THE NEW</span>
        <span>SPRING/ SUMMER LOOKS</span>
        <HeroBtn>SHOW ME</HeroBtn>
      </HeroTitle>
    </Container>
  );
};
export default Hero;

import React from "react";
import { useRouter } from "next/router";
import { HeroAction, HeroTitle, Container } from "./Hero.styles";
import { Button } from "@components/shared";
export interface HeroProps {}
const Hero: React.FC<HeroProps> = (props) => {
  const router = useRouter();
  return (
    <Container>
      <HeroAction>
        <HeroTitle>NEW <span>SPRING / SUMMER</span> LOOKS ARE HERE</HeroTitle>
        <Button width={200} onClick={() => router.push("/about")}>BROWSE NOW</Button>
      </HeroAction>
    </Container>
  );
};
export default Hero;

import Lottie from "react-lottie";
import { Layout } from "../components";
import girlAnimation from "../../data/girl.json";
import {
  NotFoundContainer,
  NotFoundTitle,
  NotFoundSubtitle
} from "./FourOhFour.styles";

const animationOptions = {
  loop: true,
  autoplay: true,
  animationData: girlAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};

export const FourOhFour = () => {
  return (
    <Layout>
      <NotFoundContainer>
        <Lottie
          options={animationOptions}
          width={300}
          height={300}
          style={{ pointerEvents: "none" }}
        />
        <NotFoundTitle>404</NotFoundTitle>
        <NotFoundSubtitle>Whoops, keep looking...</NotFoundSubtitle>
      </NotFoundContainer>
    </Layout>
  );
};

import styled from "@emotion/styled";
import Lottie from "react-lottie";
import loadingAnimation from "./loading.json";

export const LoadingWrapper = styled.div`
  height: 80vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  div svg g g g path {
    stroke: white;
  }
`;

export const LoadingIcon = styled.i`
  margin: 0 auto;
`;

export const Loading = () => {
  const animationOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };
  return (
    <LoadingWrapper>
      <Lottie options={animationOptions} width={100} height={30} />
    </LoadingWrapper>
  );
};

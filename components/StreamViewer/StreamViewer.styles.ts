import styled from "@emotion/styled";
import { VideoJS } from "../VideoJS";

export const StreamViewerWrapper = styled.div`
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(15px);
`;

export const StreamVideo = styled(VideoJS)`
  // width: 50%;
  // height: 50%;
  width: 800px;
  max-width: 100%;
  cursor: pointer;
  padding-top: 40px;
  padding-bottom: 40px;
  mix-blend-mode: hard-light;
`;

export const StreamHeaderFade = styled.div`
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  width: 100%;
  height: 200px;
  background: rgb(255, 255, 255);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
`;

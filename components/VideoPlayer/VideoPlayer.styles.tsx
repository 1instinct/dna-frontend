import styled from "@emotion/styled";

export const MainVid = styled.div`
  background: ${(p) => p.theme.colors.white.primary};
  height: 400px;
  overflow: hidden;
`;

export const VideoHover = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`;

export const VideoContainer = styled.div`
  background: url(img/static.gif);
  background-size: cover;
  background-position: 0px 0px;
  overflow: hidden;
  height: 100%;
`;

export const VideoFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0px;
`;

export const VideoControls = styled.div`
  text-align: center;
  position: absolute;
  height: 75px;
  bottom: -75px;
  width: 100%;
  color: ${(p) => p.theme.colors.white.primary};
  padding: 45px 5px 2px 5px;
  transition: bottom 0.3s ease;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.66) 100%
  );
  &:hover {
    bottom: 0px;
  }
`;

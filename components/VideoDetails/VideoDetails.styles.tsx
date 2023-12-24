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
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.66) 100%);
  &:hover {
    bottom: 0px;
  }
`;

export const Progress = styled.div`
  width: 69%;
  margin-top: 3px;
`;

export const ProgressBar = styled.input.attrs({
  type: "range"
})`
  background: ${(p) => p.theme.colors.gray.primary};
  appearance: none;
  width: 100%;
  left: 0;
  bottom: 19px;
  height: 3px;
`;

export const Elapsed = styled.div`
  pointer-events: none;
  background: ${(p) => p.theme.colors.blue.primary};
  height: 3px;
  bottom: -5px;
  position: relative;
`;

export const Mute = styled.div`
  cursor: pointer;
  width: 5%;
`;

export const CurrentTime = styled.div`
  width: 10%;
  float: left;
`;

export const Duration = styled.div`
  float: right;
  width: 10%;
`;

export const Fullscreen = styled.div`
  color: ${(p) => p.theme.colors.white.primary};
  float: right;
  cursor: pointer;
  width: 5%;
`;

export const VidInfo = styled.div`
  padding: 15px 15px 20px 15px;
  overflow-y: scroll;
  height: 100%;
`;

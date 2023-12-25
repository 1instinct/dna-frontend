import styled from "@emotion/styled";

export const MainVid = styled.div`
  background: ${(p) => p.theme.colors.white.primary};
  height: 400px;
  overflow: hidden;
  position: relative;
`;

export const VideoHover = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`;

export const VideoContainer = styled.div`
  background: url("img/static.gif");
  background-size: cover;
  background-position: 0px 0px;
  overflow: hidden;
  height: 100%;
`;

export const VideoFrame = styled.div`
  pointer-events: none;
  width: 100%;
  height: 100%;
  border: 0px;
`;

export const VideoControls = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  text-align: center;
  position: absolute;
  height: 75px;
  bottom: -75px;
  width: 100%;
  color: ${(p) => p.theme.colors.white.primary};
  padding: 45px 0 2px 0;
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

export const LeftControls = styled.div`
  display: inline-flex;
  width: 10%;
`;

export const RightControls = styled.div`
  display: inline-flex;
  width: 10%;
`;

export const Progress = styled.div`
  width: 69%;
  margin-top: 3px;
`;

export const ProgressBar = styled.input`
  position: absolute;
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.gray.dark : p.theme.colors.white.dark};
  appearance: none;
  width: 100%;
  left: 0;
  bottom: 20px;
  height: 3px;
  margin: 0;
`;

export const Elapsed = styled.div`
  position: absolute;
  pointer-events: none;
  background: ${(p) => p.theme.colors.brand.primary};
  height: 3px;
  bottom: 20px;
`;

export const Mute = styled.div`
  flex: 1;
  cursor: pointer;

  & i {
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.white.primary};
  }
`;

export const CurrentTime = styled.div`
  flex: 1;
`;

export const Duration = styled.div`
  flex: 1;
`;

export const Fullscreen = styled.div`
  flex: 1;
  cursor: pointer;

  & i {
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.white.primary};
  }
`;

export const VidInfo = styled.div`
  padding: 15px 15px 20px 15px;
  overflow-y: scroll;
  height: 100%;
`;

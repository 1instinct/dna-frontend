import styled from "@emotion/styled";

export const Progress = styled.div`
  width: 69%;
  margin-top: 3px;
`;

export const ProgressBar = styled.input.attrs({
  type: 'range',
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
import styled from "@emotion/styled";

export const MainVid = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  background: ${(p) => p.theme.colors.white.primary};
  height: 400px;
  align-items: stretch;
  overflow: hidden;
  position: relative;
`;

export const VideoHover = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`;

export const VideoContainer = styled.div`
  flex: 1;
  background: url('img/static.gif');
  background-size: cover;
  background-position: 0px 0px;
  overflow: hidden;
  height: 100%;
`;

export const VidInfo = styled.div`
  flex: 1;
  padding: 15px 15px 20px 15px;
  overflow-y: scroll;
  height: 100%;
`;

export const ShareButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  padding: 0px 15px;
`;

import styled from "@emotion/styled";

export const VideoSlideWrapper = styled.a`
  text-decoration: none;
`;

export const VideoSlideBackground = styled.div`
  display: flex;
  max-height: 66vh;
  overflow: hidden;
`;

export const VideoSlideInfo = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  background: ${(p) => p.theme.colors.white.primary};
  padding: 1px 15px 12px 15px;
  font-weight: 900;
  text-transform: uppercase;
  bottom: 0;
  font-size: 32px !important;
  ${(p) => p.theme.typography.titleLG};
`;

export const VideoSlideTitle = styled.h1`
  font-size: 18px;
`;

import styled from "@emotion/styled";

// Define your styled components
export const VideoSlideWrapper = styled.a`
  /* Your slide styles here */
`;

export const VideoSlideBackground = styled.div`
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
  /* Your slideTitle styles here */
`;

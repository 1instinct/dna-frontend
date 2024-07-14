import styled from "@emotion/styled";

export const AppWrapper = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.white.primary};
  background-blend-mode: overlay;
  background-size: cover;
  background-position: center;
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-size: ${(p) => p.theme.typography.bodyMD.fontSize};
  line-height: ${(p) => p.theme.typography.bodyMD.lineHeight};
  overflow: visible;
`;

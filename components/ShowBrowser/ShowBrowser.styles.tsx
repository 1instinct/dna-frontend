import styled from "@emotion/styled";

export const ShowBrowserWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.dark
      : p.theme.colors.white.primary};
  height: 100%;
  padding: 80px 15px 80px 15px;
  overflow-y: scroll;
`;

export const MainContent = styled.div`
  grid-column: 1 / 3;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 15px;
  padding: 15px;
  margin-bottom: 100px;
`;

export const CloseButton = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  cursor: pointer;
`;

export const ShowBrowserTitle = styled.h1`
  margin: 0;
  padding: 0;
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  margin: 0 auto 10px;
  text-align: center;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const ShowSnippet = styled.div`
  padding: 0;
`;

export const ShowSnippetImg = styled.img`
  width: 100%;
  height: auto;
  background: ${(p) => p.theme.colors.gray.medium};
`;

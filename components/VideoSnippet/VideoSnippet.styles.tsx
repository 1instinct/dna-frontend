import styled from "@emotion/styled";

export const Snippet = styled.a`
  width: 220px;
  height: 240px;
  margin: 0 5px;
  display: inline-table !important;
  background-size: cover;
  white-space: normal !important;
  font-size: 12px;
  vertical-align: top;
  text-decoration: none;
`;

export const VidPic = styled.div<any>`
  background-image: url(${(p) => p.image});
  width: 480px;
  height: 270px;
  background-position-y: -45px;
  background-size: 120%;
  background-position-x: center;
  overflow: hidden;
`;

export const VidDetails = styled.div`
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.gray.dark : p.theme.colors.white.light};
  padding: 1px 10px;
`;

export const Text = styled.h3`
  /* Your text styles here */
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
`;

export const Date = styled.p`
  /* Your date styles here */
  color: ${(p) => p.theme.isDarkMode ? p.theme.colors.white.primary : p.theme.colors.gray.dark};
`;

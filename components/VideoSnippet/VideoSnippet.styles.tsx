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
`;

export const VidPic = styled.div<any>`
  background-image: url(${(p) => p.image});
  width: 480px;
  height: 270px;
  background-position-y: -45px;
  overflow: hidden;
`;

export const VidDetails = styled.div`
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.gray.dark : p.theme.colors.gray.medium};
  padding: 1px 10px;
`;

export const Text = styled.h5`
  /* Your text styles here */
`;

export const Date = styled.p`
  /* Your date styles here */
`;

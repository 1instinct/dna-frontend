import styled from "@emotion/styled";

interface FooterStateType {
  darkMode?: boolean;
}

export const SocialContainer = styled.div<FooterStateType>`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SocialList = styled.ul`
  padding-inline-start: 0px;
`;

export const SocialListItem = styled.li<FooterStateType>`
  display: inline-block;
  margin: 0 10px;
  & a {
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  }
  & a:hover {
    color: ${(p) => p.theme.colors.brand.primary};
  }
`;

export const SocialIcon = styled.img`
  height: 40px;
  width: 40px;
  padding: 5px;
`;

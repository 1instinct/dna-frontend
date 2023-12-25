import styled from "@emotion/styled";

export const Wrapper = styled.div`
  width: 100%;
  max-width: 100%;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.dark
      : p.theme.colors.white.primary};
`;

export const HeroContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 0px;
  overflow: hidden;
  background-image: linear-gradient(
    to bottom right,
    ${(p) => p.theme.colors.brand.secondary},
    ${(p) => p.theme.colors.brand.primary}
  );
  padding: 40px;
`;

export const MainContent = styled.div`
  padding-top: 55px;
`;

export const ListTitle = styled.div`
  margin-left: 20px;
`;

export const SeeMoreIconWrapper = styled.div`
  & i {
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.brand.dark};
  }
`;

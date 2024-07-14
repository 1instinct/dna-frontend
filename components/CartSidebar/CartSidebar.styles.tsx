import styled from "@emotion/styled";

export const CartWrapper = styled.div`
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  padding: 10px 5px 0 0;

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    padding: 5px 10px 0 0;
  }
`;

export const CartTitle = styled.h2`
  outline: none;
`;

export const CartButton = styled.div`
  cursor: pointer;
  background: none;
  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    margin: 0 -5px 0 0;
  }

  > i {
    font-size: 1em;
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  }

  &:hover {
    > i {
      color: ${(p) => p.theme.colors.brand.primary};
    }
  }
`;

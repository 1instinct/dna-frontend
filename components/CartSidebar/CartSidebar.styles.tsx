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

export const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
  line-height: ${(p) => p.theme.typography.bodyMD.lineHeight};
`;

export const CartItemDescription = styled.span`
  font-size: 16px;
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
  line-height: ${(p) => p.theme.typography.bodyMD.lineHeight};
`;

export const QuantityAdjusterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const QuantitySelector = styled.input`
  width: 30px;
  text-align: center;
  margin: 0 10px;
`;

export const QuantityAdjuster = styled.button`
  width: 20px;
  height: 20px;
  background-color: lightgray;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover {
    background-color: gray;
  }
`;

export const TotalLine = styled.div`
  padding: 10px;
  font-weight: bold;
`;

export const EmptyCartMessage = styled.p`
  text-align: center;
  padding: 20px;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
`;

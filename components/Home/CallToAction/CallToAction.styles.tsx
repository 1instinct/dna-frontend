import styled from "@emotion/styled";
import isPropValid from "@emotion/is-prop-valid";

export const Container = styled("div", {
  shouldForwardProp: (prop) =>
    isPropValid(prop) && prop !== "backgroundColor" && prop !== "textColor"
})<{ backgroundColor?: string; textColor?: string }>`
  padding: 80px 20px;
  background: ${(p) => p.backgroundColor || p.theme.colors.brand.primary};
  color: ${(p) => p.textColor || p.theme.colors.white.primary};
  text-align: center;

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    padding: 60px 20px;
  }
`;

export const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: inherit;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    h2 {
      font-size: 1.75rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

export const ActionButton = styled.button`
  padding: 15px 40px;
  background: ${(p) => p.theme.colors.white.primary};
  color: ${(p) => p.theme.colors.brand.primary};
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    width: 100%;
    max-width: 300px;
  }
`;

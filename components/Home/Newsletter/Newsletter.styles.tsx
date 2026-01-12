import styled from "@emotion/styled";
import isPropValid from "@emotion/is-prop-valid";

export const Container = styled("div", {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "backgroundColor"
})<{ backgroundColor?: string }>`
  padding: 60px 20px;
  background: ${(p) =>
    p.backgroundColor ||
    (p.theme.isDarkMode
      ? p.theme.colors.black.medium
      : p.theme.colors.white.medium)};
  text-align: center;

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  }

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    padding: 40px 20px;

    h2 {
      font-size: 1.5rem;
    }
  }
`;

export const ContentWrapper = styled.div`
  p {
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.medium
        : p.theme.colors.black.medium};
    line-height: 1.6;
  }
`;

export const Form = styled.form`
  display: flex;
  gap: 10px;
  max-width: 500px;
  margin: 30px auto;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    flex-direction: column;
  }
`;

export const Input = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 12px 20px;
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.medium
        : p.theme.colors.black.medium};
  border-radius: 4px;
  font-size: 1rem;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.white.primary};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};

  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.colors.brand.primary};
  }

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    min-width: 100%;
  }
`;

export const SubmitButton = styled.button`
  padding: 12px 30px;
  background: ${(p) => p.theme.colors.brand.primary};
  color: ${(p) => p.theme.colors.white.primary};
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: ${(p) => p.theme.colors.brand.secondary};
  }

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    width: 100%;
  }
`;

export const PrivacyText = styled.p`
  font-size: 0.85rem;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.medium
      : p.theme.colors.black.medium};
  margin-top: 1rem;
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
`;

export const SocialIcon = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(p) => p.theme.colors.brand.primary};
  color: ${(p) => p.theme.colors.white.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s ease;

  &:hover {
    background: ${(p) => p.theme.colors.brand.secondary};
  }
`;

export const SuccessMessage = styled.div`
  padding: 20px;
  background: #4caf50;
  color: white;
  border-radius: 4px;
  font-weight: 600;
  max-width: 500px;
  margin: 30px auto;
`;

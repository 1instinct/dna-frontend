import styled from "@emotion/styled";

export const Container = styled.div`
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
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

export const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

export const FeatureCard = styled.div`
  padding: 30px 20px;
  border-radius: 8px;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.medium
      : p.theme.colors.white.primary};
  box-shadow: ${(p) =>
    p.theme.isDarkMode
      ? "0 2px 8px rgba(255, 255, 255, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${(p) =>
      p.theme.isDarkMode
        ? "0 4px 16px rgba(255, 255, 255, 0.15)"
        : "0 4px 16px rgba(0, 0, 0, 0.15)"};
  }
`;

export const Icon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

export const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const FeatureDescription = styled.p`
  font-size: 0.9rem;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.medium
      : p.theme.colors.black.medium};
  line-height: 1.6;
`;

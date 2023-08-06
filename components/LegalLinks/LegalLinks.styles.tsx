import styled from "@emotion/styled";

export const LegalContainer = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
  background-color: ${({ darkMode, hasBackground, theme }: any) =>
    darkMode && hasBackground ? theme.colors.brand.primary : "transparent"};
  color: ${({ darkMode, theme }: any) =>
    darkMode ? theme.colors.brand.white : theme.colors.brand.black};
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  letter-spacing: 0.05em;
  text-decoration: none;
  text-decoration-skip-ink: auto;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 1200px;
  @media (min-width: ${({ theme }: any) => theme.breakpoints.md}) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const LegalRow = styled.div`
  display: flex;
  flex-direction: row;
`;

export const LegalColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const LegalLink = styled.a<any>`
  color: ${({ darkMode, theme }: any) =>
    darkMode ? theme.colors.brand.white : theme.colors.brand.black};
  margin: 0 0.5rem;
  text-decoration: none;
  text-decoration-skip-ink: auto;
  cursor: pointer;
  &:hover {
    color: ${({ darkMode, theme }: any) =>
      darkMode ? theme.colors.brand.primary : theme.colors.brand.black};
  }
`;

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
    darkMode ? theme.colors.white.primary : theme.colors.black.primary};
  font-family: ${({ theme }: any) => theme.typography.bodySM.fontFamily};
  font-size: ${({ theme }: any) => theme.typography.bodySM.fontSize};
  font-weight: ${({ theme }: any) => theme.typography.bodySM.fontWeight};
  line-height: ${({ theme }: any) => theme.typography.bodySM.lineHeight};
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
  margin: 0 auto 1rem auto;
`;

export const LegalColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const LegalLink = styled.a<any>`
  color: ${({ darkMode, theme }: any) =>
    darkMode ? theme.colors.white.primary : theme.colors.black.primary};
  margin: 0 0.5rem;
  text-decoration: underline;
  text-decoration-skip-ink: auto;
  cursor: pointer;
  &:hover {
    color: ${({ theme }: any) => theme.colors.black.primary};
    text-decoration: underline;
  }
`;

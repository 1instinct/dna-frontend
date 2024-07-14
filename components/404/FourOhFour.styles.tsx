import styled from "@emotion/styled";

export const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: space-around;
  min-height: 80vh;
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
`;

export const NotFoundTitle = styled.h1`
  width: 100%;

  text-align: center;
`;

export const NotFoundSubtitle = styled.h2`
  width: 100%;
  text-align: center;
`;

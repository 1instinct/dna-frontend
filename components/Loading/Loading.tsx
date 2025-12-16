import styled from "@emotion/styled";

export const LoadingWrapper = styled.div`
  height: 80vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1rem;
  letter-spacing: 0.08em;
`;

export const LoadingIcon = styled.i`
  margin: 0 auto;
`;

// SSR-safe fallback without react-lottie (lottie requires `document`)
export const Loading = () => {
  return <LoadingWrapper>Loading…</LoadingWrapper>;
};

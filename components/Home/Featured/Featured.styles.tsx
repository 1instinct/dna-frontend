import styled from "@emotion/styled";
import { pxPC } from "@utilities/device-sizes";
import { XlargeTitle } from "@styles/BaseStyles";
import { Button } from "@components/shared";
export const FeaturedContainer = styled.div`
  margin-top: ${pxPC(30)};
`;
export const FeaturedTitle = styled(XlargeTitle)``;
export const FeaturedBox = styled.div`
  margin-top: ${pxPC(30)};
  flex-wrap: nowrap;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    margin-top: 0;
    flex-wrap: wrap;
    flex-direction: column;
  }
`;
type FeaturedItemProps = {
  background: string;
};
export const FeaturedItem = styled.div<FeaturedItemProps>`
  background-image: url(${(p) => p.background});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 450px;
  position: relative;
  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
  }
`;
export const FeaturedButton = styled(Button)`
  position: absolute;
  bottom: ${pxPC(84)};
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  text-align: center;

  @media (min-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    width: 60%;
  }

  @media (min-width: ${(p) => p.theme.breakpoints.values.md}px) {
    width: 50%;
  }

  @media (min-width: ${(p) => p.theme.breakpoints.values.lg}px) {
    width: 40%;
  }
`;

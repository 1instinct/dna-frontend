import styled from "@emotion/styled";
import { pxPC } from "../../../utilities/device-sizes";
import ButtonBase from "@material-ui/core/ButtonBase";
import { XlargeTitle } from "../../../styles/BaseStyles";
import { Button } from "@components/shared";
type BannerContainerProps = {
  background: string;
};
export const BannerContainer = styled.div<BannerContainerProps>`
  background-image: url(${(p) => p.background});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  display: flex;
  justify-content: center;
  align-items: center;
  height: 450px;
`;
export const BannerTitle = styled(XlargeTitle)``;
export const BannerBtn = styled(Button)``;

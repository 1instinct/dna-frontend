import styled from "@emotion/styled";
import { transparentize } from "polished";
import { pxPC, pxIphone } from "../../../utilities/device-sizes";
import {
  PriceText,
  ProductTitle,
  XlargeTitle,
  XsmallText
} from "../../../styles/BaseStyles";

export const Title = styled(XlargeTitle)`
  font-family: "Bebas Neue";
  margin-bottom: ${pxPC(30)};
  font-size: 44px;
  line-height: 54px;
  @media (max-width: 375px) {
    margin-bottom: ${pxIphone(19)};
  }
`;

export const SwiperWrap = styled.div`
  margin-top: ${pxPC(30)};
  overflow: hidden;
  @media (max-width: 375px) {
    margin-top: ${pxIphone(19)};
  }
`;

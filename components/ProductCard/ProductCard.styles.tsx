import styled from "@emotion/styled";
import Link from "next/link";
import Rating from "@material-ui/lab/Rating";
import { pxPC } from "../../utilities/device-sizes";
import { XlargeTitle, DescText, PriceText } from "../../styles/BaseStyles";

export const ProductCardWrapper = styled.div`
  margin-top: ${pxPC(30)};
  cursor: pointer;
`;

export const ProductImgWrapper = styled.div`
  width: 100%;
  height: ${pxPC(478)};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  @media (max-width: ${(p) => p.theme.breakpoints.values.sm}) {
    flex-direction: column;
  }
`;
export const ProductImg = styled.img`
  object-fit: cover;
  width: 100%;
  height: 100%;
`;
export const ProductTitle = styled.h4`
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;
export const ProductDesc = styled.p`
  font-weight: 100;
`;
export const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  align-self: stretch;
`;
export const ProductFooterLeft = styled.div``;
export const ProductFooterRight = styled.div``;
export const ProductRate = styled(Rating)`
  margin-top: ${pxPC(18)};
`;
export const Price = styled.h3`
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-align: right;
`;
export const ThreeDot = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: ${pxPC(3)};
`;
export const Dot = styled.div`
  width: ${pxPC(12)};
  height: ${pxPC(12)};
  border-radius: 50%;
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  margin-right: ${pxPC(8)};
  background: ${(p) => p.color};
`;
// export const Dot1 = styled(Dot)`
//   background: #cbc8bf;
// `;
// export const Dot2 = styled(Dot)`
//   background: #979d93;
// `;
// export const Dot3 = styled(Dot)`
//   background: #979d93;
// `;

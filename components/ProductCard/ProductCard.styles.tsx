import styled from "@emotion/styled";
import Link from "next/link";
import Rating from "@material-ui/lab/Rating";
import { pxPC } from "../../utilities/device-sizes";
import { XlargeTitle, DescText, PriceText } from "../../styles/BaseStyles";
import { Button } from "@components/shared";

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
  position: relative;

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
export const ProductFooterRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
  overflow: visible;
`;
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

export const AddToCartButton = styled(Button)`
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  margin-top: ${pxPC(18)};
  border: none;
  cursor: pointer;
  padding: 3px 5px;

  & i {
    color: ${(p) => p.theme.colors.white.primary} !important;
  }
`;

export const ThreeDot = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  margin-top: ${pxPC(3)};
`;

type DotProps = {
  color: string;
};

export const Dot = styled.div<DotProps>`
  width: ${pxPC(12)};
  height: ${pxPC(12)};
  border-radius: 50%;
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  margin-right: ${pxPC(8)};
  background-color: ${(p) => p.color};
`;

type FavoriteButtonProps = {
  isFavorited?: boolean;
};

export const FavoriteButton = styled.button<FavoriteButtonProps>`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.9)"};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: transform 0.2s, background 0.2s;
  z-index: 10;

  &:hover {
    transform: scale(1.1);
    background: ${(p) =>
      p.theme.isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 1)"};
  }

  &:active {
    transform: scale(0.95);
  }
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

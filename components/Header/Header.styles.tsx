import styled from "@emotion/styled";
import { Popover } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import { pxIphone } from "../../utilities/device-sizes";

export const TopHeader = styled.div`
  padding: 10px 0 12px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  @media (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    height: 30px;
  }
`;

export const LogoDiv = styled.div`
  width: 355px;
  padding: 15px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;
export const HeaderDiv = styled.header`
  z-index: 9;
`;

export interface LinkDivProps {
  isActive: boolean;
}

export const LinkDiv = styled.a<LinkDivProps>`
  font-size: 14px;
  text-decoration: none;
  ${(p) =>
    p.isActive
      ? null
      : `
    pointer-events: none;
    cursor: default;
    text-decoration: none;
  `}
  &:hover {
    color: ${(p) => p.theme.colors.brand.primary};
  }
`;

export const BottomHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0px;
  & > :first-of-type {
    padding-left: 0px;
  }
  & > :last-child {
    padding-right: 0px;
  }
`;

export const Category = styled.a`
  padding: 15px;
`;

export const LeftSide = styled.div`
  width: auto;
  display: flex;
  position: absolute;
  left: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  z-index: 2;

  @media (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    justify-content: flex-end;
  }
`;

export const RightSide = styled.div`
  width: auto;
  display: flex;
  position: absolute;
  right: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  z-index: 2;

  @media (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    justify-content: flex-end;
  }
`;

export const HeaderOptions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin: 0 20px;
  justify-content: space-around;
  & > a {
    margin: 0 10px;
    font-family: ${(p) => p.theme.typography.titleMD.fontFamily};
    font-size: ${(p) => p.theme.typography.titleMD.fontSize};
    font-weight: ${(p) => p.theme.typography.titleMD.fontWeight};
    line-height: ${(p) => p.theme.typography.titleMD.lineHeight};
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

export const CartToggle = styled.div`
  margin: -10px 3px 0 0;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};

  @media (min-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    & span.MuiBadge-root span.MuiBadge-badge {
      top: 5px !important;
    }
  }

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    margin: 10px 10px 0 0;
  }
`;

export const HeaderAccount = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin: 0 20px;
  justify-content: space-around;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  @media (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    display: none;
  }
`;

export const AccountEmail = styled.div`
  font-family: ${(p) => p.theme.typography.titleMD.fontFamily};
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
  cursor: pointer;
`;

export const AccountMenu = styled(Popover)`
  font-family: ${(p) => p.theme.typography.titleMD.fontFamily};
  text-align: right;
  & div.MuiPaper-root {
    width: 160px;
    padding: 20px;
    top: 45px !important;
    left: auto !important;
    right: 105px;
    background-color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.dark
        : p.theme.colors.white.primary};
  }
`;

export const AccountOption = styled.div`
  cursor: pointer;
  margin: 5px 0;
  &:first-of-type {
    margin: 0;
  }

  & > a {
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  }
`;

export const ArrowDown = styled(ArrowDropDownIcon)`
  margin-left: 5px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  @media (max-width: 768px) {
    display: none !important;
  }
`;

export const ShoppingCart = styled.img`
  width: 17px;
  height: auto;
  margin-left: 21px;
  margin-right: 13px;
  @media (max-width: 768px) {
    display: none !important;
  }
`;
export const FavoriteIcon = styled(FavoriteBorderIcon)`
  font-size: 12px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin-right: 13px;
  @media (max-width: 768px) {
    display: none !important;
  }
`;
export const UserIconMo = styled.img`
  display: none;
  @media (max-width: 768px) {
    display: block;
    width: ${pxIphone(19)};
    height: auto;
    margin-right: ${pxIphone(12)};
  }
`;
export const CartMo = styled.img`
  display: none;
  @media (max-width: 768px) {
    display: block;
    width: ${pxIphone(17)};
    height: auto;
    margin-right: ${pxIphone(15)};
  }
`;
export const CustomIcon = styled.img`
  width: ${pxIphone(37)};
  height: auto;
`;

export const CameraIcon = styled.img`
  width: 11px;
  height: auto;
  margin-right: 3.88px;
  @media (max-width: 375px) {
    width: 20.71px;
    height: auto;
    margin-right: 7.76px;
  }
`;
export const FacebookIcon = styled.img`
  width: 6.81px;
  height: auto;
  margin-right: 3.88px;
  @media (max-width: 375px) {
    width: 13.63px;
    height: auto;
    margin-right: 7.76px;
  }
`;
export const PlayIcon = styled.img`
  width: 12.29px;
  height: auto;
  margin-right: 3.88px;
  @media (max-width: 375px) {
    width: 24.59px;
    height: auto;
    margin-right: 7.76px;
  }
`;
export const CircleIcon = styled.img`
  width: 10.35px;
  height: auto;
  @media (max-width: 375px) {
    width: 20.71px;
    height: auto;
  }
`;

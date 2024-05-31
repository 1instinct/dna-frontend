import styled from "@emotion/styled";
import Link from "next/link";
export interface MenuItemProps {
  isActive: boolean;
}

export interface DropDownProps {
  isActive: boolean;
}

export const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  padding-bottom: 13px;
  justify-content: center;
  gap: 40px;
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
`;

export const MenuItem = styled.div<MenuItemProps>`
  font-size: 14px;
  line-height: 150%;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  text-align: center;
  &:after {
    transition: transform 1s linear;
    width: 120%;
    height: 1px;
    background-color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.black.primary
        : p.theme.colors.white.primary};
    content: "";
    position: absolute;
    bottom: 0;
    display: ${(props) => (props.isActive ? "block" : "none")};
    transform: ${(props) =>
      props.isActive ? "translateX(0)" : "translateX(-100%)"};
  }
`;

export const DropDown = styled.div<DropDownProps>`
  position: absolute;
  background-color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.white.primary};
  left: 0;
  top: 100%;
  width: 100%;
  z-index: 10000;
  transition: all 1s linear;
  display: ${(props) => (props.isActive ? "flex" : "none")};
  transform: ${(props) =>
    props.isActive ? "translateY(0)" : "translateY(-100%)"};
  box-shadow: 0 6px 12px rgb(0 0 0 / 5%);
  flex-direction: row;
  justify-content: center;
  padding: 0 20px 20px 20px;
`;

export const DropDownColumn = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 20px 40px 20px;
`;

export const DropDownHeader = styled.h4`
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const DropDownLink = styled.a`
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary} !important;
`;

export const DropDownAdvert = styled.div`
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin: 0 20px;
  padding: 10px;
`;

export const Vr = styled.div`
  display: block;
  width: 2px;
  min-height: 100%;
  border-right: 1px solid black;
  position: relative;
`;

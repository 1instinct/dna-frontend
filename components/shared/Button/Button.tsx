import React from "react";
import styled from "@emotion/styled";

interface ButtonProps {
  props?: any;
  children: React.ReactNode;

  width?: number;
  onClick: () => void;
}

const ButtonElement = styled.button<ButtonProps>`
  width: ${(p) => (p.width ? `${p.width}px` : "100%")};
  margin: 0;
  padding: 5px 10px 8px 10px;
  background-size: 100%;
  background-position: 50% 100%;
  background-image: radial-gradient(
    circle at 50% 100%,
    ${(p) => p.theme.colors.brand.primary},
    ${(p) => p.theme.colors.brand.secondary}
  );
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  font-size: ${(p) => p.theme.typography.titleMD.fontSize};
  font-family: ${(p) => p.theme.typography.titleMD.fontFamily};
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
  transition: all 0.33s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.66s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background-size: 200%;
    background-position: 50% 100%;
  }

  @media (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    width: 100%;
    font-size: ${(p) => p.theme.typography.titleSM.fontSize};
    padding: 5px 10px 6px 10px;
  }
`;

export const Button = ({ props, children, width, onClick }: ButtonProps) => {
  return (
    <ButtonElement onClick={onClick} width={width} {...props}>
      {children}
    </ButtonElement>
  );
};

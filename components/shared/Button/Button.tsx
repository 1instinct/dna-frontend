import React from "react";
import styled from "@emotion/styled";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

const ButtonElement = styled.button`
  padding: 5px 10px;
  background-color: blue;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: darkblue;
  }
`;

export const Button = ({ children, onClick }: ButtonProps) => {
  return <ButtonElement onClick={onClick}>{children}</ButtonElement>;
};

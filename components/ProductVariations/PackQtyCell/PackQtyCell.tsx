import React from "react";
import styled from "@emotion/styled";
import { PackQtyCellProps } from "../types";

const PackQtyCellWrapper = styled.div`
  label: PackQtyCellWrapper;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20.11px;
`;

const Button = styled.div`
  label: Button;
  cursor: pointer;
  padding: 10px;
`;

const Counter = styled.span`
  label: Counter;
  margin: 0 15px;
`;

export const PackQtyCell: React.FC<PackQtyCellProps> = ({
  packQty,
  updatePackQty
}) => {
  return (
    <PackQtyCellWrapper>
      <Button onClick={() => updatePackQty(1)}>-</Button>
      <Counter>{packQty}</Counter>
      <Button onClick={() => updatePackQty(-1)}>+</Button>
    </PackQtyCellWrapper>
  );
};

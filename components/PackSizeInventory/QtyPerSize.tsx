import React from "react";
import styled from "@emotion/styled";
import { QtyPerSizeProps, CellProps } from "./types";

const QtyPerSizeWrapper = styled.div`
  label: QtyPerSizeWrapper;
  display: inline-flex;
  font-weight: 700;
  margin-right: 15px;
`;

const Cell = styled.div<CellProps>`
  label: Cell;
  border: 1px solid #000;
  width: 49px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 37.75px;
  border-right: ${(props) =>
    props.isFirst ? "1px solid transparent" : "1px solid #000"};
`;

export const QtyPerSize: React.FC<QtyPerSizeProps> = ({ size, qty }) => {
  return (
    <QtyPerSizeWrapper>
      <Cell isFirst>{qty}</Cell>
      <Cell>{size}</Cell>
    </QtyPerSizeWrapper>
  );
};

export default QtyPerSize;

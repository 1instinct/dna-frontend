import React from "react";
import { ColorCellProps } from "../types";
import styled from "@emotion/styled";

const ColorCellWrapper = styled.div`
  label: ColorCellWrapper;
  display: flex;
  align-items: center;
  padding-left: 10px;
`;

type ColorDotProps = {
  dotColor: string;
};

const ColorDot = styled.div<ColorDotProps>`
  label: ColorDot;
  height: 20px;
  width: 20px;
  border-radius: 20px;
  background-color: ${(props) => props.dotColor};
  position: relative;
  top: 1px;
  margin-right: 5px;
`;

const ColorName = styled.span`
  label: ColorName;
  font-family: Roboto Condensed;
  font-weight: 400;
  font-size: 20.11px;
  line-height: 25.14px;
  color: #000;
`;

export const ColorCell: React.FC<ColorCellProps> = ({
  colorName,
  colorValue
}) => {
  return (
    <ColorCellWrapper>
      <ColorDot dotColor={colorValue} />
      <ColorName>{colorName}</ColorName>
    </ColorCellWrapper>
  );
};

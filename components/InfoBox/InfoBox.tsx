import React from "react";
import styled from "@emotion/styled";
import { InfoBoxProps } from "./types";

const Info = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  padding-top: 20px;
  padding-bottom: 20px;
  border-top: 1px solid #ececec;
  border-bottom: 1px solid #ececec;
`;

export const InfoBox: React.FC<InfoBoxProps> = ({
  children
}: {
  children: string;
}) => <Info>{children}</Info>;

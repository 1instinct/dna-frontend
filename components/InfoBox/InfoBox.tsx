import React from "react";
import { InfoBoxProps } from "./types";

export const InfoBox: React.FC<InfoBoxProps> = ({
  children
}: {
  children: string;
}) => <div className="my-5 border-y border-border/30 py-5">{children}</div>;

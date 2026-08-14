import React from "react";

export interface LayoutProps {
  children: JSX.Element[] | JSX.Element;
  /** Fixed background element rendered outside the scroll container */
  background?: React.ReactNode;
}

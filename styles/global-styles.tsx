import React from "react";
import { Global, css } from "@emotion/react";

export const GlobalStyles = () => (
  <>
    <Global
      styles={css`
        body {
          background: #ffffff;
          color: hotpink !important;
        }
      `}
    />
  </>
);

// disable eslint rule for parentheses around functions
// eslint-disable-next-line func-names
import React from "react";
import { Global, css, SerializedStyles } from "@emotion/react";
import { saturate } from "polished";

export const GlobalStyles = ({ theme, children }: any) => (
  <Global
    styles={
      css(`
        @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");

        html {
          /* overflow: hidden; */
          width: 100%;
          height: 100%;
        }

        body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          text-rendering: auto;
          // -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-display: swap;
          font-smooth: 2em;
        }
        #__next {
          margin: 0;
          padding: 0;
        }

        ::-moz-selection {
          /* Code for Firefox */
          color: ${theme.colors.white.primary};
          background: ${theme.colors.brand.primary};
        }

        ::selection {
          color: ${theme.colors.white.primary};
          background: ${theme.colors.brand.primary};
        }

        a {
          cursor: pointer;
          color: ${theme.colors.brand.primary};
        }

        p {
          margin: 10px 0px 20px;
        }

      select {
        font-size: 28.95px;
        line-height: 34.74px;
        border: 2px solid ${theme.colors.black.primary};
        box-sizing: border-box;
        transition: background-color 0.3s;
        width: 100%;
        max-width: 400px;
        text-transform: uppercase;
        text-align-last: center;
        background: url("https://cdn1.iconfinder.com/data/icons/pinpoint-action/48/arrow-dropdown-24.png")
          no-repeat 95% 50%;
        padding: 10px 10px;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
      }

        svg {
          margin: 0;
        }

        select {
          font-size: 28.95px;
          line-height: 34.74px;
          border: 2px solid ${theme.colors.black.primary};
          box-sizing: border-box;
          transition: background-color 0.3s;
          width: 100%;
          max-width: 400px;
          text-transform: uppercase;
          text-align-last: center;
          background: url("https://cdn1.iconfinder.com/data/icons/pinpoint-action/48/arrow-dropdown-24.png")
            no-repeat 95% 50%;
          padding: 10px 10px;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }

        select:active,
        select:focus {
          outline: none;
        }

        button {
          background-color: ${theme.colors.brand.primary};
          border: 0;
          color: ${theme.colors.white.primary};
          width: 100%;
          max-width: 400px;
          font-size: 29.24px;
          line-height: 35.09px;
          font-weight: bold;
          padding: 10px 10px;
          cursor: pointer;
        }

        button:hover {
          background-color: ${saturate(0.5, theme.colors.brand.primary)};
        }

        button:active {
          background-color: ${saturate(0.5, theme.colors.brand.primary)};
        }

        button:focus,
        .size-selection button:focus {
          outline: none;
        }
        i {
          color: ${
            theme.isDarkMode
              ? theme.colors.white.primary
              : theme.colors.black.primary
          };
        }
        .pc-menu-item {
          color: ${
            theme.isDarkMode
              ? theme.colors.white.primary
              : theme.colors.black.primary
          };
          font-family: ${(p: any) => p.theme.typography.bodySM.fontFamily};
          font-weight: ${(p: any) => p.theme.typography.bodySM.fontWeight};
          font-size: ${(p: any) => p.theme.typography.bodySM.fontSize};
          margin-right: 82px !important;
        }
        .pc-menu-wrap {
          padding-bottom: 30px !important;
        }
        .bm-overlay {
          top: 0;
        }
        .bm-burger-button {
          span span {
            background: ${
              theme.isDarkMode
                ? theme.colors.white.primary
                : theme.colors.black.primary
            } !important;
          }
        }
      `) as SerializedStyles
    }
  />
);

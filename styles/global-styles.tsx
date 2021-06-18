import React from "react";
import { Global, css } from "@emotion/react";

export const GlobalStyles = () => (
  <>
    <Global
      styles={css`
         html {
         overflow: hidden;
         }
        body {
          background: #ffffff;
          color: hotpink !important;
           margin: 0;
          padding: 0;
           overflow: hidden;
        }
         * {
          font-family: Menlo, Monaco, "Lucida Console", "Liberation Mono", "DejaVu Sans Mono",
            "Bitstream Vera Sans Mono", "Courier New", monospace, serif;
        }

        a {
          color: #22bad9;
        }
        p {
          font-size: 14px;
          line-height: 24px;
        }
        article {
          margin: 0 auto;
          max-width: 650px;
        }
        button {
          align-items: center;
          background-color: #22bad9;
          border: 0;
          color: white;
          display: flex;
          padding: 5px 7px;
          transition: background-color 0.3s;
        }
        button:active {
          background-color: #1b9db7;
        }
        button:disabled {
          background-color: #b5bebf;
        }
        button:focus {
          outline: none;
        }
        .bm-burger-button {
          position: fixed;
          width: 36px;
          height: 30px;
          left: 36px;
          top: 36px;
        }
        .bm-burger-button button:focus {
          outline: 2px solid #000;
          outline-offset: 8px;
        }
        .bm-burger-button button:focus + span span.bm-burger-bars {
          background-color: #c94e50;
        }
        .right .bm-burger-button {
          left: initial;
          right: 36px;
        }
        .bm-burger-bars {
          background: #000;
        }
        .bm-burger-bars-hover {
          background: #a90000;
        }
        .bm-cross-button {
          height: 24px;
          width: 24px;
        }
        .bm-cross {
          background: #000;
        }
        .bm-menu-wrap {
          position: fixed;
          height: 100%;
        }
        .bm-menu {
          background: #373a47;
          padding: 2.5em 1.5em 0;
          fontsize: 1.15em;
          height: 100%;
        }
        .bm-morph-shape {
          fill: #373a47;
        }
        .bm-item-list {
          color: #b8b7ad;
          padding: 0.8em;
          height: 100%;
        }
        .bm-item {
          display: block;
          padding: 0.8em;
        }
        .bm-overlay {
          top: 0;
          background: rgba(0, 0, 0, 0.3);
        }       
      `}
    />
  </>
);

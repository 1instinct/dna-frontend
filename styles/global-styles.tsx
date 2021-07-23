import React from "react";
import { Global, css } from "@emotion/react";

export const GlobalStyles = () => (
  <>
    <Global
      styles={css`
        @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");

        html {
          overflow: hidden;
          width: 100%;
          height: 100%;
        }

        body {
          background: #ffffff;
          color: black !important;
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }

        * {
          font-family: "Bebas Neue", sans-serif;
        }

        #__next {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        a {
          color: #22bad9;
        }

        h2 {
          font-size: 28.93px;
          line-height: 34.72px;
          margin: 15px 0px;
        }

        h3 {
          font-size: 24px;
          line-hegiht: 28.8px;
          margin: 15px 0px;
        }

        h4 {
          font-size: 18px;
        }

        p {
          font-family: "Roboto Condensed", sans-serif;
          font-size: 18px;
          line-height: 21.09px;
          font-weight: 400;
          margin: 10px 0px 20px;
        }

        article {
          margin: 0 auto;
          max-width: 650px;
        }

        .size-selection {
          justify-content: space-between;
          display: flex;
          max-width: 400px;
        }

        .size-selection button {
          background-color: white;
          border: 2px solid black;
          color: black;
          max-width: 70px;
          font-size: 23.24px;
          line-height: 35.09px;
          font-weight: bold;
          padding: 5px 10px;
        }

        select {
          font-size: 28.95px;
          line-height: 34.74px;
          border: 2px solid #000000;
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

        button,
        .select-size button {
          font-family: "Bebas Neue", sans-serif;
          text-align: center;
          margin: 10px 0px;
          transition: background-color 0.3s;
          text-transform: uppercase;
        }

        button {
          background-color: #eb8b8b;
          border: 0;
          color: white;
          width: 100%;
          max-width: 400px;
          font-size: 29.24px;
          line-height: 35.09px;
          font-weight: bold;
          padding: 10px 10px;
        }

        @media screen and (max-width: 800px) {
          .size-selection button {
            max-width: 50px;
          }
        }

        button:active {
          background-color: #f75b5b;
        }

        button:focus,
        .size-selection button:focus {
          outline: none;
        }

        .size-selection button:focus {
          background-color: #eb8b8b;
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
          top: 0;
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
        .pc-menu-item {
          color: #000;
        }
      `}
    />
  </>
);

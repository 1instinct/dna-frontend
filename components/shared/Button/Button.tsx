import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

interface ButtonProps {
  props?: any;
  variant?: "solid" | "outline";
  children: React.ReactNode;
  isSvg?: boolean;
  width?: number;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const ButtonSolid = styled.button<ButtonProps>`
  width: ${(p) => (p.width ? `${p.width}px` : "100%")};
  height: 60px;
  margin: 0;
  padding: 5px 10px 8px 10px;
  background-size: 100%;
  background-position: 50% 100%;
  background-image: radial-gradient(
    circle at 50% 100%,
    ${(p) => p.theme.colors.brand.primary},
    ${(p) => p.theme.colors.brand.secondary}
  );
  color: ${(p) => p.theme.colors.white.primary};
  border: none;
  cursor: pointer;
  border-radius: 12px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  font-size: ${(p) => p.theme.typography.titleMD.fontSize};
  font-family: ${(p) => p.theme.typography.titleMD.fontFamily};
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.22);
  letter-spacing: 1px;
  transition: all 0.66s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    text-shadow: 0px 2px 6px rgba(0, 0, 0, 0.12);
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.24s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background-size: 200%;
    background-position: 50% 100%;
  }

  @media (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    font-size: ${(p) => p.theme.typography.titleSM.fontSize};
    padding: 5px 10px 6px 10px;
  }
`;

const ButtonOutline = styled.button<ButtonProps>`
  width: ${(p) => (p.width ? `${p.width}px` : "100%")};
  height: 60px;
  margin: 0;
  padding: 5px 10px 8px 10px;
  border: 3px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  background: transparent;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  cursor: pointer;
  border-radius: 12px;
  box-shadow: 0px 2px 6px
    ${(p) =>
      p.theme.isDarkMode ? "rgba(255, 255, 255, 0.33)" : "rgba(0, 0, 0, 0.1)"};
  text-transform: uppercase;
  font-size: ${(p) => p.theme.typography.titleMD.fontSize};
  font-family: ${(p) => p.theme.typography.titleMD.fontFamily};
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.22);
  letter-spacing: 1px;
  transition: all 0.66s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    text-shadow: 0px 2px 6px rgba(0, 0, 0, 0.12);
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.24s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background-size: 200%;
    background-position: 50% 100%;
  }

  @media (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    font-size: ${(p) => p.theme.typography.titleSM.fontSize};
    padding: 5px 10px 6px 10px;
  }
`;

const ButtonLink = styled.a`
  display: block;
  width: 400px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: 0.5s all ease-in-out;

  &:hover {
    & svg path {
      transition: 0.5s all ease-in-out;
      stroke-dasharray: 70, 8;
    }

    & svg g path {
      fill: ${(p) => p.theme.colors.brand.bright};
      transition: 0.5s all ease-in-out;
    }
  }
`;

const SvgWrapper = styled.svg`
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
`;

const ButtonShape = styled.path`
  fill: ${(p) => p.theme.colors.brand.primary};
`;

const Stroke = styled.path`
  fill: none;
  stroke: ${(p) => p.theme.colors.brand.primary};
  stroke-width: 4;
  stroke-linecap: round;
  stroke-miterlimit: 10;
  stroke-dasharray: 88, 8;
`;

export const Button = ({
  variant,
  isSvg,
  props,
  children,
  width,
  onClick,
  className
}: ButtonProps) => {
  const theme = useTheme();
  if (isSvg) {
    return (
      <ButtonLink
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        style={{ width: width || "100%" }}
      >
        <SvgWrapper
          width="234"
          height="72"
          viewBox="0 0 234 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_i_52_299)">
            <ButtonShape
              d="M12.4972 11.7832C13.0978 7.88071 16.4557 5 20.4042 5L220.675 5C225.578 5 229.327 9.37062 228.582 14.2168L221.503 60.2168C220.902 64.1193 217.544 67 213.596 67H13.3253C8.42207 67 4.67259 62.6294 5.41836 57.7832L12.4972 11.7832Z"
              fill={theme.colors.brand.light}
            />
          </g>
          <Stroke
            d="M220.675 2.5H20.4042C15.2218 2.5 10.8146 6.28093 10.0263 11.403L2.94745 57.403C1.96862 63.7636 6.88982 69.5 13.3253 69.5H213.596C218.778 69.5 223.185 65.7191 223.974 60.597L231.053 14.597C232.031 8.23643 227.11 2.5 220.675 2.5Z"
            stroke="black"
            stroke-width="5"
          />
          <g>
            <text transform="matrix(1 0 0 1 234 72)">See More</text>
          </g>
          <defs>
            <filter
              id="filter0_i_52_299"
              x="0.32251"
              y="0"
              width="233.355"
              height="76"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="2" />
              <feComposite
                in2="hardAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
              />
              <feBlend
                mode="normal"
                in2="shape"
                result="effect1_innerShadow_52_299"
              />
            </filter>
          </defs>
        </SvgWrapper>
      </ButtonLink>
    );
  }

  if (variant === "outline") {
    return (
      <ButtonOutline
        onClick={onClick}
        width={width}
        className={className}
        {...props}
      >
        {children}
      </ButtonOutline>
    );
  }

  return (
    <ButtonSolid
      onClick={onClick}
      width={width}
      className={className}
      {...props}
    >
      {children}
    </ButtonSolid>
  );
};

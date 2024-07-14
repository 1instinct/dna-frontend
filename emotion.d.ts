import "@emotion/react";
import { string } from "prop-types";

declare module "@emotion/react" {
  export interface Theme {
    isDarkMode: boolean;
    colors: {
      purple?: {
        light: string;
        primary: string;
      };
      gray: {
        dark: string;
        primary: string;
        medium: string;
        light: string;
        background: string;
      };
      black: {
        primary: string;
        medium: string;
        light: string;
      };
      white: {
        primary: string;
        medium: string;
        light: string;
      };
      blue: {
        primary: string;
        medium: string;
        light: string;
      };
      brand: {
        bright?: string;
        primary: string;
        secondary: string;
        light: string;
      };
      todo: {
        primary: string;
        medium: string;
        light: string;
      };
      design: {
        primary: string;
        medium: string;
        light: string;
      };
      developed: {
        primary: string;
        medium: string;
        light: string;
      };
      red: {
        primary: string;
        medium: string;
        light: string;
      };
    };
    gradients: {
      rainbow: string;
      pinkhaze: string;
    };
    fonts: {
      body: {
        monoBold: string;
        monoBoldItalic: string;
        monoItalic: string;
        monoExtraLight: string;
        monoExtraLightItalic: string;
        monoSemiBold: string;
        bold: string;
        condensedMedium: string;
      };
    };
    background: {
      ambient: string;
      brand: string;
      yellow: string;
      OmniscientPink: string;
      AmbientVectors: string;
      AmbientVectorsReversed: string;
    };
    effect: {
      BrandGlow: {
        boxShadow: string;
        background: string;
      };
      BrandGlowPrimaryLG: {
        background: string;
        boxShadow: string;
      };
      BrandGlowPrimarySM: {
        boxShadow: string;
        background: string;
      };
      BrandGlowSecondarySM: {
        boxShadow: string;
        background: string;
      };
      Skeuomorphism: {
        boxShadow: string;
        background: string;
      };
    };
    typography: {
      titleXXL: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
        lineHeight: string;
        color: string;
      };
      titleXL: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
        lineHeight: string;
        color: string;
      };
      titleLG: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
        lineHeight: string;
        color: string;
      };
      titleMD: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
        lineHeight: string;
        color: string;
      };
      titleSM: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
        lineHeight: string;
        color: string;
      };
      bodyMD: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
        lineHeight: string;
        color: string;
      };
      bodySM: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
        lineHeight: string;
        color: string;
      };
      bodyXS: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
        lineHeight: string;
        color: string;
      };
    };
    breakpoints: {
      values: {
        ss: number;
        xs: number;
        sm: number;
        md: number;
        lg: number;
        lgxl: number;
        xl: number;
      };
      heights: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        lgxl: number;
        xl: number;
      };
    };
  }
}

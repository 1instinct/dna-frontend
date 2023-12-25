import "@emotion/react";
import { string } from "prop-types";

declare module "@emotion/react" {
  export interface Theme {
    name: string;
    industry: string;
    hasVideo: boolean;
    hasSpree: boolean;
    mediaProvider: string;
    isLiveStreaming: boolean;
    isDarkMode: boolean;
    colors: {
      purple?: {
        light: string;
        medium: string;
        dark: string;
        primary: string;
      };
      gray: {
        light: string;
        medium: string;
        dark: string;
        primary: string;
      };
      black: {
        light: string;
        medium: string;
        dark: string;
        primary: string;
      };
      white: {
        light: string;
        medium: string;
        dark: string;
        primary: string;
      };
      blue: {
        light: string;
        medium: string;
        dark: string;
        primary: string;
      };
      brand: {
        light: string;
        medium: string;
        dark: string;
        primary: string;
        secondary: string;
      };
      todo: {
        light: string;
        medium: string;
        dark: string;
        primary: string;
      };
      design: {
        light: string;
        medium: string;
        dark: string;
        primary: string;
      };
      developed: {
        light: string;
        medium: string;
        dark: string;
        primary: string;
      };
      red: {
        light: string;
        medium: string;
        dark: string;
        primary: string;
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
        dark: string;
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

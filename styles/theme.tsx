import { lighten } from "polished";
const darkMode = process.env.NEXT_PUBLIC_DARK_MODE || "false";
export const theme = {
  isDarkMode: darkMode === "true",
  colors: {
    gray: {
      dark: "#333",
      primary: "#666",
      medium: "#999",
      light: "#c4c4c4",
      background: "#eee"
    },
    black: {
      primary: "#000",
      medium: "#585858",
      light: lighten(0.33, "#000")
    },
    white: {
      primary: "#fff",
      medium: lighten(0.66, "#fff"),
      light: "#f9f9f9"
    },
    blue: {
      primary: "#7b61ff",
      medium: lighten(0.66, "#7b61ff"),
      light: lighten(0.33, "#7b61ff")
    },
    brand: {
      primary: "#EB8B8B",
      secondary: "#E6CDC0",
      light: "#F9F2EA"
    },
    todo: {
      primary: "#BFB081",
      medium: lighten(0.66, "#BFB081"),
      light: lighten(0.33, "#BFB081")
    },
    design: {
      primary: "#FF6C52",
      medium: lighten(0.66, "#FF6C52"),
      light: lighten(0.33, "#FF6C52")
    },
    developed: {
      primary: "#A5D8BC",
      medium: lighten(0.66, "#A5D8BC"),
      light: lighten(0.33, "#A5D8BC")
    },
    red: {
      primary: "#D04040",
      medium: lighten(0.66, "#D04040"),
      light: lighten(0.33, "#D04040")
    }
  },
  background: {
    ambient: "linear-gradient(180deg, #EB8B8B 0%, #CC8BEB 100%)",
    brand: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 51.56%)",
    yellow:
      "linear-gradient(180deg, rgba(248, 207, 81, 0.64) 0%, rgba(248, 207, 81, 0) 100%)",
    OmniscientPink:
      "linear-gradient(180deg, #EB8B8B 0%, rgba(235, 139, 139, 0) 100%)",
    AmbientVectors:
      "linear-gradient(142.27deg, #EB8B8B 21.81%, #DC8BBA 43.8%, #CC8BEB 66.99%)",
    AmbientVectorsReversed: "linear-gradient(180deg, #EB8B8B 0%, #CC8BEB 100%)"
  },
  effect: {
    BrandGlow: {
      boxShadow: "0px 4px 4px rgba(94, 0, 249, 0.42)",
      background: "#C4C4C4"
    },
    BrandGlowPrimaryLG: {
      background: "#C4C4C4",
      boxShadow:
        "0px 4px 4px rgba(48, 196, 160, 0.65), -4px -4px 10px #D8B5B5, 4px 4px 20px rgba(94, 0, 249, 0.42)"
    },
    BrandGlowPrimarySM: {
      boxShadow:
        "0px 2px 2px rgba(0, 0, 0, 0.25), -2px -2px 4px #D8B5B5, 2px 2px 10px rgba(94, 0, 249, 0.42)",
      background: "#c4c4c4"
    },
    BrandGlowSecondarySM: {
      boxShadow:
        "2px 3px 2px 1px rgba(122, 73, 152, 0.25), 0px -1px 2px #D8B5B5",
      background: "#C4C4C4"
    },
    Skeuomorphism: {
      boxShadow: "1px 1px 3px #FFFFFF, -1px -1px 2px rgba(2, 2, 2, 0.33)",
      background: "#C4C4C4"
    }
  },
  typography: {
    titleXXL: {
      fontFamily: "Anybody Light",
      fontWeight: "bold",
      fontSize: "72px",
      lineHeight: "86px",
      color: "#000"
    },
    titleXL: {
      fontFamily: "Anybody Light",
      fontWeight: "bold",
      fontSize: "33.8681px",
      lineHeight: "41px",
      color: "#000"
    },
    titleLG: {
      fontFamily: "Anybody Light",
      fontWeight: "bold",
      fontSize: "24px",
      lineHeight: "30px",
      color: "#000"
    },
    titleMD: {
      fontFamily: "Anybody ExtraLight",
      fontWeight: "bold",
      fontSize: "20px",
      lineHeight: "24px",
      color: "#000"
    },
    titleSM: {
      fontFamily: "Anybody ExtraLight",
      fontWeight: "normal",
      fontSize: "14px",
      lineHeight: "1.5rem",
      color: "#000"
    },
    titleXS: {
      fontFamily: "Anybody ExtraLight",
      fontWeight: "normal",
      fontSize: "10px",
      lineHeight: "0.9rem",
      color: "#000"
    },
    bodyMD: {
      fontFamily: "Anybody ExtraLight",
      fontWeight: "normal",
      fontSize: "18px",
      lineHeight: "20px",
      color: "#000"
    },
    bodySM: {
      fontFamily: "Anybody ExtraLight",
      fontWeight: "normal",
      fontSize: "14px",
      lineHeight: "16px",
      color: "#000"
    },
    bodyXS: {
      fontFamily: "Anybody ExtraLight",
      fontWeight: "normal",
      fontSize: "9px",
      lineHeight: "0.9rem",
      color: "#000"
    }
  },
  breakpoints: {
    values: {
      ss: 375,
      xs: 414,
      sm: 768,
      md: 1024,
      lg: 1280,
      lgxl: 1440,
      xl: 1800
    },
    heights: {
      xs: 414,
      sm: 768,
      md: 1024,
      lg: 1280,
      lgxl: 1440,
      xl: 1800
    }
  }
};

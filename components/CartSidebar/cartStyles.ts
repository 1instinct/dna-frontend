import { useTheme } from "@emotion/react";

const cartStyles = () => {
  const theme = useTheme();

  const { isDarkMode } = theme;

  return {
    bmBurgerButton: {
      button: {
        position: "fixed",
        width: "36px",
        height: "30px",
        left: "1.06vw",
        top: "3.73vw",
        display: "none"
      }
    },
    bmBurgerBars: {
      display: "none"
      // background: isDarkMode ? theme.colors.white.primary : theme.colors.black.primary,
    },
    bmBurgerBarsHover: {
      display: "none"
      // background: isDarkMode ? theme.colors.white.primary : theme.colors.black.primary,
    },
    bmCrossButton: {
      height: "24px",
      width: "24px"
    },
    bmCross: {
      background: isDarkMode
        ? theme.colors.white.primary
        : theme.colors.black.primary
    },
    bmMenuWrap: {
      position: "fixed",
      height: "100%",
      top: "0"
    },
    bmMenu: {
      background: isDarkMode
        ? theme.colors.black.dark
        : theme.colors.white.primary,
      padding: "10%",
      fontsize: "1.15em",
      height: "100%"
      /* width: '100vw' */
    },
    bmMorphShape: {
      fill: isDarkMode ? theme.colors.white.primary : theme.colors.black.primary
    },
    bmItemList: {
      color: "#b8b7ad",
      padding: "0 0em",
      height: "100%"
    },
    bmItem: {
      display: "block",
      padding: "0.8em",
      color: isDarkMode
        ? theme.colors.white.primary
        : theme.colors.black.primary
    },
    bmOverlay: {
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      // background: "rgba(0, 0, 0, 0.3)",
      background: isDarkMode
        ? "rgba(0, 0, 0, 0.66)"
        : "rgba(255, 255, 255, 0.66)"
    }
  };
};

export default cartStyles;

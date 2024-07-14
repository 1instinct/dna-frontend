import React, { useState } from "react";
import PropTypes from "prop-types";
import { BurgerIconProps } from "./types/BurgerIconProps";
const BurgerIcon = (props: BurgerIconProps) => {
  const {
    styles,
    customIcon,
    barClassName,
    className,
    onClick,
    onIconHoverChange
  } = props;
  const [hover, setHover] = useState(false);
  const getLineStyle = (index: number) => {
    return {
      position: "absolute" as "absolute",
      height: "20%",
      left: 0,
      right: 0,
      top: 20 * (index * 2) + "%",
      opacity: hover ? 0.6 : 1,
      ...(hover && styles?.bmBurgerBarsHover)
    };
  };
  let icon;
  let buttonStyle = {
    left: 0,
    top: 0,
    zIndex: 1,
    width: "100%",
    height: "100%",
    margin: 0,
    padding: 0,
    border: "none",
    fontSize: 0,
    background: "transparent",
    cursor: "pointer",
    position: "absolute" as "absolute"
  };
  if (customIcon) {
    let extraProps = {
      className: `bm-icon ${customIcon.props.className || ""}`.trim(),
      style: {
        ...{ width: "100%", height: "100%" },
        ...styles?.bmIcon
      }
    };
    icon = React.cloneElement(customIcon, extraProps);
  } else {
    icon = (
      <span>
        {[0, 1, 2].map((bar) => (
          <span
            key={bar}
            className={`bm-burger-bars ${barClassName} ${
              hover ? "bm-burger-bars-hover" : ""
            }`.trim()}
            style={{
              ...getLineStyle(bar),
              ...styles?.bmBurgerBars
            }}
          ></span>
        ))}
      </span>
    );
  }
  return (
    <div
      className={`bm-burger-button ${className}`.trim()}
      style={{
        ...{ zIndex: 1000 },
        ...styles?.bmBurgerButton
      }}
    >
      <button
        id="react-burger-menu-btn"
        onClick={onClick}
        onMouseOver={() => {
          setHover(true);
          if (onIconHoverChange) {
            onIconHoverChange({ isMouseIn: true });
          }
        }}
        onMouseOut={() => {
          setHover(false);
          if (onIconHoverChange) {
            onIconHoverChange({ isMouseIn: false });
          }
        }}
        style={buttonStyle}
      >
        Open Menu
      </button>
      {icon}
    </div>
  );
};

BurgerIcon.propTypes = {
  barClassName: PropTypes.string,
  customIcon: PropTypes.element,
  styles: PropTypes.object,
  onClick: PropTypes.func,
  onIconStateChange: PropTypes.func
};
BurgerIcon.defaultProps = {
  barClassName: "",
  className: "",
  styles: {}
};
export default BurgerIcon;

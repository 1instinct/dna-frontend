import { FunctionComponent, ReactElement, ReactNode } from "react";
import { BurgerIconStyles } from "./BurgerIconProps";
declare global {
  interface Window {
    mina: any;
    gtag: any;
  }
}
export type Path = {
  animate: Function;
};
export type BurgerMenu = {
  slide: ReactElement;
  stack: ReactElement;
  elastic: ReactElement;
  bubble: ReactElement;
  push: ReactElement;
  pushRotate: ReactElement;
  scaleDown: ReactElement;
  scaleRotate: ReactElement;
  fallDown: ReactElement;
  reveal: ReactElement;
};

export type menuItem = {
  name: string;
  key: string;
  icon?: () => ReactNode;
};
export type menuDataItem = {
  name: string;
  key: string;
  children?: menuDataItem[];
  icon?: () => ReactNode;
  pcIcon?: () => ReactNode;
  pcMenuItem?: ReactNode;
};
export interface MainMenuProps {
  showMenuHeader?: boolean;
  pcWrapClassName?: string;
  pcMenuItemClassName?: string;
  onMenuItemClick?: (keyPath: string, key: string) => void;
  menusData: menuDataItem[];
  animationType?: keyof BurgerMenu;
  children?: JSX.Element<type, props, key> | JSX.Element<type, props, key>[];
  bodyClassName?: string;
  burgerBarClassName?: string;
  burgerButtonClassName?: string;
  className?: string;
  crossButtonClassName?: string;
  crossClassName?: string;
  customBurgerIcon?: ReactElement | false;
  customCrossIcon?: ReactElement | false;
  customOnKeyDown?: EventListener;
  disableAutoFocus?: boolean;
  disableCloseOnEsc?: boolean;
  disableOverlayClick?: boolean | Function;
  htmlClassName?: string;
  id?: string;
  isOpen?: boolean;
  itemClassName?: string;
  itemListClassName?: string;
  itemListElement?:
    | "div"
    | "nav"
    | FunctionComponent<{ className: string; style: object }>;
  menuClassName?: string;
  menuFooter?: boolean;
  morphShapeClassName?: string;
  noOverlay?: boolean;
  noTransition?: boolean;
  onClose?: Function;
  onIconHoverChange?: () => void;
  onOpen?: Function;
  onStateChange?: Function;
  outerContainerId?: string;
  overlayClassName?: string;
  pageWrapId?: string;
  right?: boolean;
  showMenuHeader?: boolean;
  styles?: BurgerIconStyles;
  width?: number | string;
  outterContainerId?: string;
}

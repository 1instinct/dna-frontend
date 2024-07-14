import { menuDataItem } from "./index";

export interface IDesktopMenuProps {
  // menusData: menuDataItem[];
  menusData: any;
  menusLoading: boolean;
  pcMenuItemClassName?: string;
  pcWrapClassName?: string;
  onMenuItemClick?: (keyPath: string, key: string) => void;
}

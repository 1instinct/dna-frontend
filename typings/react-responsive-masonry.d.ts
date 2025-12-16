declare module "react-responsive-masonry" {
  import { ReactNode } from "react";

  export interface ResponsiveMasonryProps {
    columnsCountBreakPoints?: { [key: number]: number };
    children: ReactNode;
  }

  export const ResponsiveMasonry: React.FC<ResponsiveMasonryProps>;
  export const Masonry: React.FC<{ children: ReactNode }>;
}

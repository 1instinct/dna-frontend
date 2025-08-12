declare module "react-responsive" {
  import { ComponentType, Context, ReactNode } from "react";

  interface MediaQueryAllQueryable {
    width?: number;
    height?: number;
    orientation?: "portrait" | "landscape";
    [key: string]: any;
  }

  interface MediaQueryProps extends MediaQueryAllQueryable {
    query?: string;
    children?: ReactNode;
  }

  export const MediaQuery: ComponentType<MediaQueryProps>;

  export const Context: Context<MediaQueryAllQueryable>;

  // Explicitly define ResponsiveContext to include Provider
  export const ResponsiveContext: Context<MediaQueryAllQueryable> & {
    Provider: ComponentType<{
      value: MediaQueryAllQueryable;
      children?: ReactNode;
    }>;
    Consumer: ComponentType<{
      children: (value: MediaQueryAllQueryable) => ReactNode;
    }>;
  };

  export function useMediaQuery(
    settings: MediaQueryAllQueryable & { query?: string }
  ): boolean;
}

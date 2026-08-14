import React, { ReactNode, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@lib/utils";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import {
  fetchMenuLocation,
  fetchMenuItems,
  useMenuLocation,
  useMenuItems
} from "../../hooks";
import { SocialLinks } from "../SocialLinks";
import { Logo } from "@components/shared/Logo";
import { AnimatedLogo } from "../Logo/AnimatedLogo";
import hardcodedColumns from "./footer.json";

export type CLASSESTYPE = {
  root?: string;
  grid?: string;
  columnClassWrapper?: string;
  columnTitle?: string;
  subTitle?: string;
  linkItem?: string;
  description?: string;
  iconWrapperClass?: string;
};
export type LinkType = {
  url: string;
  text?: string;
};
export type IconLinkType = {
  icon: ReactNode;
  url: string;
};
export type Column = {
  title?: string;
  subTitle?: string;
  links?: LinkType[];
  descriptions?: string[];
  iconLinks?: IconLinkType[];
};
export type FooterDataType = {
  logo?: ReactNode;
  columns: Column[];
  mobileIconLinks?: IconLinkType[];
};
export interface FootProps {
  classes?: CLASSESTYPE;
  footerData: FooterDataType;
}

export const Footer: React.FC<FootProps> = ({ classes, footerData }) => {
  const {
    data: menuItemsData,
    isLoading: menuItemsIsLoading,
    isSuccess: menuItemsIsSuccess
  } = useMenuItems(2);

  const apiColumns = useMemo(() => {
    if (!menuItemsIsSuccess || !menuItemsData?.response_data) return null;
    const allItems =
      menuItemsData?.response_data?.menu_location_listing?.length > 0
        ? menuItemsData.response_data.menu_location_listing[0].menu_item_listing
        : [];
    // Filter to root items only — children are nested via `childrens` field
    const menuItems = allItems.filter(
      (item: any) => !item.parent_id || item.parent_id === 0
    );
    return menuItems.map((menuItem: any) => ({
      title: menuItem.name,
      links:
        menuItem.childrens?.map((child: any) => ({
          text: child.name,
          url: child.url || ""
        })) || []
    }));
  }, [menuItemsIsSuccess, menuItemsData]);

  const columns = apiColumns || footerData.columns || hardcodedColumns;
  const logoPath =
    process.env.NEXT_PUBLIC_LOGO_PATH || "images/open-graph-instinct-dna.jpg";
  const FooterLogo = footerData.logo as ReactNode;
  const siteTitle = process.env.NEXT_PUBLIC_SHORT_TITLE || "DNA";

  return (
    <footer
      className={cn(
        "border-t border-glass-border bg-surface-deep pt-10 pb-16 text-white",
        classes?.root
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center">
        <Link
          href="/"
          className="no-underline text-white transition-opacity hover:opacity-80"
        >
          <AnimatedLogo
            className="h-[50px] w-auto"
            animate={false}
            showTagline={false}
            variant="outline"
          />
        </Link>
      </div>

      {/* Columns Grid */}
      <div
        className={cn(
          "section-container grid justify-between gap-8 py-5 font-title",
          "grid-cols-1 xs:grid-cols-2 sm:grid-cols-4",
          classes?.grid
        )}
      >
        {columns.map((item: Column, index: number) => (
          <div
            className={cn("flex flex-col", classes?.columnClassWrapper)}
            key={index}
          >
            {item.title && (
              <div
                className={cn(
                  "mb-5 whitespace-nowrap font-pressstart text-[10px] leading-[17px] text-neon-cyan xs:mb-3 xs:text-xs xs:leading-6",
                  classes?.columnTitle
                )}
              >
                {item.title}
              </div>
            )}
            {item.subTitle && (
              <div
                className={cn("font-title text-white/60", classes?.subTitle)}
              >
                {item.subTitle}
              </div>
            )}
            {item.links &&
              item.links.map((v: LinkType, i: number) =>
                v.url !== "" ? (
                  <Link
                    className={cn(
                      "font-body text-sm leading-[150%] text-white/70 no-underline transition-colors hover:text-neon-cyan",
                      classes?.linkItem
                    )}
                    href={v.url}
                    key={i}
                  >
                    {v.text}
                  </Link>
                ) : (
                  <div
                    className={cn(
                      "mb-1 font-body text-sm leading-[150%] text-white/70",
                      classes?.description
                    )}
                    key={i}
                  >
                    {v.text}
                  </div>
                )
              )}
            {item.descriptions &&
              item.descriptions.map((desc: string, i: number) => (
                <div
                  className={cn(
                    "mb-1 font-mono-extralight text-sm leading-[150%] text-white/40",
                    classes?.description
                  )}
                  key={i}
                >
                  {desc}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="section-container">
        <div className="my-6 border-t border-glass-border" />
      </div>

      <SocialLinks isDark />

      {/* Copyright */}
      <p className="mt-6 text-center font-mono-extralight text-xs text-white/40">
        &copy; {new Date().getFullYear()} {siteTitle}. All rights reserved.
      </p>
    </footer>
  );
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["menu_location", 2], () =>
    fetchMenuLocation(2)
  );
  await queryClient.prefetchQuery(["menu_items", 2], () => fetchMenuItems(2));
  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

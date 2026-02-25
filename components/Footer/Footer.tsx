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
    const menuItems =
      menuItemsData?.response_data?.menu_location_listing?.length > 0
        ? menuItemsData.response_data.menu_location_listing[0].menu_item_listing
        : [];
    return menuItems.map((menuItem: any) => ({
      title: menuItem.name,
      links:
        menuItem.childrens?.map((child: any) => ({
          text: child.name,
          url: child.link || ""
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
        "border-t border-border/30 bg-background pt-10 pb-16 text-foreground",
        classes?.root
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center">
        <Link
          href="/"
          className="no-underline text-foreground hover:text-brand transition-colors"
        >
          {logoPath ? (
            <Image
              src={
                logoPath.startsWith("/") || logoPath.startsWith("http")
                  ? logoPath
                  : `/${logoPath}`
              }
              alt={siteTitle}
              width={0}
              height={0}
              sizes="(max-width: 768px) 100px, 141px"
              style={{ width: "auto", height: "65px" }}
              priority
            />
          ) : (
            FooterLogo
          )}
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
                  "mb-5 whitespace-nowrap text-sm font-normal leading-[17px] text-foreground xs:mb-2 xs:text-title-md xs:leading-6 xs:text-gray-medium",
                  classes?.columnTitle
                )}
              >
                {item.title}
              </div>
            )}
            {item.subTitle && (
              <div className={cn("font-title", classes?.subTitle)}>
                {item.subTitle}
              </div>
            )}
            {item.links &&
              item.links.map((v: LinkType, i: number) =>
                v.url !== "" ? (
                  <a
                    className={cn(
                      "font-body text-sm leading-[150%] text-gray-medium transition-colors hover:text-brand",
                      classes?.linkItem
                    )}
                    href={v.url}
                    key={i}
                  >
                    {v.text}
                  </a>
                ) : (
                  <div
                    className={cn(
                      "mb-1 font-body text-sm leading-[150%] text-gray-medium",
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
                    "mb-1 font-body text-sm leading-[150%] text-gray-medium",
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

      <SocialLinks isDark />
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

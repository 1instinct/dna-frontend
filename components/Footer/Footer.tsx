import React, { ReactNode, useMemo } from "react";
import classnames from "classnames";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import {
  fetchMenuLocation,
  fetchMenuItems,
  useMenuLocation,
  useMenuItems
} from "../../hooks";
import { SocialLinks } from "../SocialLinks";
import Image from "next/image";
import { Logo } from "@components/shared/Logo";
import hardcodedColumns from "./footer.json";

import {
  Container,
  Grid,
  LogoDiv,
  LinkDiv,
  Column,
  ColumnTitle,
  ColumnSubTitle,
  LinkItem,
  Description,
  IconLink,
  IconLinkWrapper,
  IconLinksMo,
  MobileIconLink
} from "./Footer.styles";

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
export type Link = {
  url: string;
  text?: string;
};
export type IconLink = {
  icon: ReactNode;
  url: string;
};
export type Column = {
  title?: string;
  subTitle?: string;
  links?: Link[];
  descriptions?: string[];
  iconLinks?: IconLink[];
};
export type FooterDataType = {
  logo?: ReactNode;
  columns: Column[];
  mobileIconLinks?: IconLink[];
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

  // Transform API menu data to footer columns format
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

  // Use API columns if available, otherwise use passed footerData columns or hardcoded fallback
  const columns = apiColumns || footerData.columns || hardcodedColumns;
  const logoPath =
    process.env.NEXT_PUBLIC_LOGO_PATH || "images/open-graph-instinct-dna.jpg";
  const Logo = footerData.logo as ReactNode;
  const siteTitle = process.env.NEXT_PUBLIC_SHORT_TITLE || "DNA";
  const gridClass = classes?.grid || "";
  const columnClass = classes?.columnClassWrapper || "";
  const columnTitleClass = classes?.columnTitle || "";
  const subTitleClass = classes?.subTitle || "";
  const linkItemClass = classes?.linkItem || "";
  const descClass = classes?.description || "";
  const iconWrapperClass = classes?.iconWrapperClass || "";
  const mobileIconLinks = footerData.mobileIconLinks;

  return (
    <Container className={classnames(classes?.root)}>
      <LogoDiv>
        <LinkDiv isActive href="/">
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
            Logo
          )}
        </LinkDiv>
      </LogoDiv>
      <Grid className={gridClass}>
        {columns.map((item: Column, index: number) => (
          <Column className={columnClass} key={index}>
            {item.title && (
              <ColumnTitle className={columnTitleClass}>
                {item.title}
              </ColumnTitle>
            )}
            {item.subTitle && (
              <ColumnSubTitle className={subTitleClass}>
                {item.subTitle}
              </ColumnSubTitle>
            )}
            {item.links &&
              item.links.map((v: Link, i: number) =>
                v.url !== "" ? (
                  <LinkItem className={linkItemClass} href={v.url} key={i}>
                    {v.text}
                  </LinkItem>
                ) : (
                  <Description className={descClass} key={i}>
                    {v.text}
                  </Description>
                )
              )}
          </Column>
        ))}
      </Grid>
      <SocialLinks isDark />
    </Container>
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

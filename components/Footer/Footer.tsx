import React, { ReactNode } from "react";
import classnames from "classnames";
import { SocialLinks } from "..";

import {
  Container,
  Grid,
  LogoDiv,
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
  const Logo = footerData.logo as ReactNode;
  const gridClass = classes?.grid || "";
  const columnClass = classes?.columnClassWrapper || "";
  const columnTitleClass = classes?.columnTitle || "";
  const subTitleClass = classes?.subTitle || "";
  const linkItemClass = classes?.linkItem || "";
  const descClass = classes?.description || "";
  const iconWrapperClass = classes?.iconWrapperClass || "";
  const columns = footerData.columns;
  const mobileIconLinks = footerData.mobileIconLinks;
  return (
    <Container className={classnames(classes?.root)}>
      {Logo && <LogoDiv>{Logo ? Logo : null}</LogoDiv>}
      <Grid className={gridClass}>
        {columns.map((item, index) => (
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
              item.links.map((v, i) => (
                <LinkItem className={linkItemClass} key={i} href={v.url}>
                  {v.text}
                </LinkItem>
              ))}
            {item.descriptions &&
              item.descriptions.map((desc, idx) => (
                <Description className={descClass} key={idx}>
                  {desc}
                </Description>
              ))}
            {item.iconLinks && (
              <IconLinkWrapper className={iconWrapperClass}>
                {item.iconLinks.map((icon, iconId) => (
                  <IconLink key={iconId} href={icon.url}>
                    {icon.icon}
                  </IconLink>
                ))}
              </IconLinkWrapper>
            )}
          </Column>
        ))}
      </Grid>
      <SocialLinks isDark />
    </Container>
  );
};

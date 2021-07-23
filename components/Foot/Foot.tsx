import React, { ReactNode } from "react";
import classnames from "classnames";
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
} from "./Foot.styles";
import { Icon } from "@material-ui/core";
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
export const Foot: React.FC<FootProps> = (props) => {
  const { classes, footerData } = props;
  let Logo = footerData.logo as React.ComponentType;
  let gridClass = classes?.grid || "";
  let columnClass = classes?.columnClassWrapper || "";
  let columnTitleClass = classes?.columnTitle || "";
  let subTitleClass = classes?.subTitle || "";
  let linkItemClass = classes?.linkItem || "";
  let descClass = classes?.description || "";
  let iconWrapperClass = classes?.iconWrapperClass || "";
  let columns = footerData.columns;
  let mobileIconLinks = footerData.mobileIconLinks;
  return (
    <Container className={classnames(classes?.root)}>
      {Logo && <LogoDiv>{Logo}</LogoDiv>}
      <Grid className={gridClass}>
        {columns.map((item, index) => (
          <Column className={columnClass} key={index}>
            {item.title && <ColumnTitle className={columnTitleClass}>{item.title}</ColumnTitle>}
            {item.subTitle && (
              <ColumnSubTitle className={subTitleClass}>{item.subTitle}</ColumnSubTitle>
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
      {mobileIconLinks && (
        <IconLinksMo>
          {mobileIconLinks.map((link, linkId) => (
            <MobileIconLink href={link.url} key={linkId}>
              {link.icon}
            </MobileIconLink>
          ))}
        </IconLinksMo>
      )}
    </Container>
  );
};

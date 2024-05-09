import React, { Fragment, useState, useCallback } from "react";
import styled from "@emotion/styled";
import isPropValid from "@emotion/is-prop-valid";
import { slide as BurgerMenu } from "react-burger-menu";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";
import { SocialLinks } from "../";
import { menuStyles, darkMenuStyles } from "./menuStyles";
import { useTheme } from "@emotion/react";
import { useRouter } from "next/router";

import { MenuToggle, MenuFooter } from "./MainMenu.styles";

import {
  StyledList,
  StyledListItem,
  StyledListItemText,
  StyledListItemIcon
} from "./MobileMenu.styles";
import constants from "../../utilities/constants";

export interface MenuItemProps {
  paddingLeft: string;
}

const MenuItem = styled(StyledListItem, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "paddingLeft"
})<MenuItemProps>`
  padding: 0 0 0 ${(props) => props.paddingLeft} !important;
  margin: 5px 0;
  & div span {
    font-family: "Bebas Neue";
  }
`;

export const MobileMenu = ({
  showMenuHeader,
  onMenuItemClick,
  menusData
}: any) => {
  const theme = useTheme();
  const router = useRouter();
  const currYear = new Date().getFullYear();
  const [open, setOpen] = useState(false);
  const [keyPath, setKeyPath] = useState("");
  const menuItems =
      menusData?.menu_location_listing?.length > 0
        ? menusData?.menu_location_listing[0].menu_item_listing
        : [];
  
  const toggleMenu = () => setOpen((value: any) => !value);

  const handleClick = useCallback(
    (kp: any, key: any) => {
      // if (onMenuItemClick) {
      //   onMenuItemClick(key);
      // }
      setKeyPath((pre) => {
        if (kp == pre) {
          // console.log("closing");
          let str = kp.replace("/" + key, "");
          return str;
        } else {
          // console.log("opening");
          return kp;
        }
      });
    },
    [onMenuItemClick]
  );

  const handleItemClick = (item: any, hasChildren: boolean, pathSlug: string, slug: string) => {
    if (hasChildren) {
      handleClick(pathSlug, slug);
    } else {
      router.push(item.url); // Navigate to the item's URL.
      toggleMenu(); // Close the sidebar menu.
    }
  };

  const renderMenuItems = (
    menuData: any[],
    parentKeyPath: string,
    level: number
  ) => {
    const paddingLeft = level * 20 + "px";
    // const isArray = Array.isArray(localMenuData);
    // console.log(isArray, localMenuData);
    // const menuItems = isArray
    //   ? localMenuData
    //   : menusData?.menu_location_listing[0].menu_item_listing;
    
    constants.IS_DEBUG && console.log("menuItems: ", menuItems);
    if (menuData.length) {
      return (
        <StyledList disablePadding>
          {menuData.map((item: any, index: any) => {
            const hasChildren = item.childrens.length > 0;
            const subItems = hasChildren ? item.childrens : [];
            const slug = item.name.toLowerCase();
            const pathSlug = parentKeyPath + "/" + slug;
            constants.IS_DEBUG && subItems.length && console.log("subItems: ", subItems, pathSlug, keyPath.indexOf(pathSlug) != -1);

            return (
              <Fragment key={pathSlug}>
                <MenuItem
                  key={`${pathSlug}-1`}
                  paddingLeft={paddingLeft}
                  onClick={() => handleItemClick(item, hasChildren, pathSlug, slug)}
                  button
                >
                  {/* <StyledListItemIcon>{item.icon ? item.icon() : null}</StyledListItemIcon> */}
                  {/* <StyledListItemText primary={item.name.replace("/", "_")} /> */}
                  <StyledListItemText primary={item.name} />
                  {hasChildren && (keyPath.indexOf(pathSlug) !== -1 ? <ExpandLess /> : <ExpandMore />)}
                </MenuItem>
                {hasChildren && (
                  <Collapse
                    timeout="auto"
                    unmountOnExit
                    in={keyPath.indexOf(pathSlug) !== -1}
                  >
                    {renderMenuItems(subItems, pathSlug, level + 1)}
                  </Collapse>
                )}
              </Fragment>
            );
          })}
        </StyledList>
      );
    }
    return null;
  };

  return (
    <BurgerMenu
      width={"66%"}
      isOpen={open}
      onOpen={toggleMenu}
      onClose={toggleMenu}
      styles={theme.isDarkMode ? darkMenuStyles : menuStyles}
      // {...others}
    >
      {/* <BurgerMenu width={220} isOpen={open} onOpen={toggleMenu} onClose={toggleMenu} {...others}> */}
      {showMenuHeader ? (
        <>
          <div onClick={toggleMenu}>
            <i className="btb bt-close" />
          </div>
        </>
      ) : null}
      {/* {renderMenuItems(menuItemsData && menuItemsData?.response_data.menu_location_listing[0], "", 0)} */}
      {menuItems && renderMenuItems(menuItems, "", 0)}
      <MenuItem
        paddingLeft={"10px"}
        onClick={() => {
          toggleMenu();
          router.push("/login");
        }}
        button
      >
        <hr />
        Login
      </MenuItem>
      <SocialLinks />
      <MenuFooter>
        <div>
          <a href="/privacy">Privacy Policy</a> -{" "}
          <a href="/terms">Terms &amp; Conditions</a> - RETURN POLICY
        </div>
        <div>All Materials Copyright © {currYear} POL Clothing</div>
      </MenuFooter>
    </BurgerMenu>
  );
};

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { IDesktopMenuProps } from "./types/DesktopMenu";
import { menuDataItem } from "./types";

import {
  Container,
  MenuItem,
  DropDown,
  DropDownLink,
  DropDownColumn,
  DropDownHeader,
  DropDownAdvert,
  Vr
} from "./DesktopMenu.styles";

const DesktopMenu: React.FC<IDesktopMenuProps> = (props: IDesktopMenuProps) => {
  const router = useRouter();
  let timer: any;
  const {
    pcWrapClassName,
    menusData,
    menusLoading,
    pcMenuItemClassName,
    onMenuItemClick
  } = props;
  const menuItems =
    menusData && menusData.menu_location_listing
      ? menusData?.menu_location_listing[0]?.menu_item_listing
      : [];
  const desktopMenu = () => {
    if (menusLoading) {
      return [];
    }
    return menuItems.map((item: any, index: number) => {
      return (
        <MenuItem
          onMouseEnter={handleMouseEnter.bind(null, item)}
          onMouseLeave={handleMouseLeave}
          onClick={() => router.push(item.url)}
          isActive={currentKey == item.id}
          key={`${index}-1`}
        >
          {item.name}
        </MenuItem>
      );
    });
  };
  const [currentKey, setCurrentKey] = useState();
  const handleMouseEnter = useCallback((item: any) => {
    if (timer) {
      clearTimeout(timer);
    }
    setCurrentKey(item.id);
  }, []);
  const handleMouseLeave = useCallback(() => {
    timer = setTimeout(() => setCurrentKey(undefined), 300);
  }, []);
  // useEffect(() => {
  //   console.log(menusData);
  // }, []);

  if (menusLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Container className={pcWrapClassName}>
      {desktopMenu()}
      {menuItems.map((item: any, index: any) => {
        if (item.childrens.length) {
          return (
            <DropDown
              onMouseEnter={handleMouseEnter.bind(null, item)}
              onMouseLeave={handleMouseLeave}
              isActive={currentKey == item.id}
              key={`${index}-2`}
            >
              {item.childrens?.map((item: any, index: any) => (
                <DropDownColumn key={`${index}-column`}>
                  <DropDownHeader key={`${index}-header`}>
                    {item.name}
                  </DropDownHeader>
                  {item.childrens?.map((item: any, index: any) => (
                    <DropDownLink href={item.url} key={`${index}-link`}>
                      {item.name}
                    </DropDownLink>
                  ))}
                </DropDownColumn>
              ))}
              <Vr />
              <DropDownAdvert>
                <h1>On Sale</h1>
              </DropDownAdvert>
            </DropDown>
          );
        }
      })}
    </Container>
  );
};
export default DesktopMenu;

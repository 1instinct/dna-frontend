import React, { useEffect, useCallback, useState } from "react";
import classnames from "classnames";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import {
  fetchMenuLocation,
  fetchMenuItems,
  useMenuLocation,
  useMenuItems
} from "../../hooks";
import { MainMenuProps, menuDataItem } from "./types";
import DesktopMenu from "./DesktopMenu";

import { HiddenOnDesktop, HiddenOnMobile } from "./MainMenu.styles";
import { MobileMenu } from "./MobileMenu";

// const SidebarMenu = styled(List)`
//   width: 100%;
// `;

export const MainMenu = (props: MainMenuProps) => {
  const {
    showMenuHeader,
    pcWrapClassName,
    pcMenuItemClassName,
    onMenuItemClick,
    animationType,
    children,
    menusData,
    ...others
  } = props;

  const {
    error: menuLocationError,
    status: menuLocationStatus,
    data: menuLocationData,
    isLoading: menuLocationIsLoading,
    isSuccess: menuLocationIsSuccess
  }: {
    error: any;
    status: any;
    data: any;
    isLoading: boolean;
    isSuccess: boolean;
  } = useMenuLocation(1);

  const {
    error: menuItemsError,
    status: menuItemsStatus,
    data: menuItemsData,
    isLoading: menuItemsIsLoading,
    isSuccess: menuItemsIsSuccess
  }: {
    error: any;
    status: any;
    data: any;
    isLoading: boolean;
    isSuccess: boolean;
  } = useMenuItems(1);

  if (menuItemsIsLoading || menuLocationIsLoading || !menuItemsData) return null;

  if (menuItemsIsLoading) return <>Loading...</>;

  return (
    <>
      <HiddenOnDesktop>
        <MobileMenu
          showMenuHeader={showMenuHeader}
          onMenuItemClick={onMenuItemClick}
          menusLoading={menuItemsIsLoading}
          menusData={menuItemsData ? menuItemsData?.response_data : []}
        />
      </HiddenOnDesktop>
      <HiddenOnMobile>
        {menuItemsIsSuccess ? (
          <DesktopMenu
            onMenuItemClick={onMenuItemClick}
            pcWrapClassName={classnames(pcWrapClassName)}
            pcMenuItemClassName={pcMenuItemClassName}
            menusLoading={menuItemsIsLoading}
            menusData={menuItemsData ? menuItemsData?.response_data : []}
            // menusData={menusData}
          />
        ) : null}
      </HiddenOnMobile>
    </>
  );
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  // await queryClient.prefetchQuery(["posts", 1], () => fetchPosts(1));
  await queryClient.prefetchQuery(["menu_location", 1], () =>
    fetchMenuLocation(1)
  );
  await queryClient.prefetchQuery(["menu_items", 1], () => fetchMenuItems(1));

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

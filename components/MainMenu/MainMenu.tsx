import React, { useEffect, useCallback, useState } from "react";
import classnames from "classnames";
import { QueryClient } from "react-query";
import { useTheme } from "@emotion/react";
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
import { Loading } from "..";
import { MobileMenu } from "./MobileMenu";
import { ShowBrowser } from "../ShowBrowser";

// const SidebarMenu = styled(List)`
//   width: 100%;
// `;

export const MainMenu = (props: MainMenuProps) => {
  const {
    darkMode,
    isBrowsing,
    setIsBrowsing,
    showMenuHeader,
    pcWrapClassName,
    pcMenuItemClassName,
    onMenuItemClick,
    animationType,
    children,
    menusData,
    ...others
  } = props;

  const theme = useTheme();
  const hasSpree = theme.hasSpree;

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

  // useEffect(() => {
  //   if (menuItemsIsSuccess && menuLocationIsSuccess) {
  //     console.log(
  //       menusData,
  //       "MENU LOCATION",
  //       menuLocationData?.response_data,
  //       "MENU ITEMS",
  //       menuItemsData?.response_data
  //     );
  //   }
  // }, []);

  const renderMenus = () => {
    if (hasSpree) {
      if (menuItemsIsLoading || menuLocationIsLoading) return <Loading />;
      return (
        <>
          <HiddenOnDesktop>
            <MobileMenu
              isBrowsing={isBrowsing}
              setIsBrowsing={setIsBrowsing}
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

          {isBrowsing && (
            <ShowBrowser
              darkMode={darkMode}
              isBrowsing={isBrowsing}
              setIsBrowsing={setIsBrowsing}
            />
          )}
        </>
      );
    }
    return <></>;
  };

  return (
    <>
      {renderMenus()}
      {!hasSpree && (
        <HiddenOnDesktop>
          <MobileMenu
            isBrowsing={isBrowsing}
            setIsBrowsing={setIsBrowsing}
            showMenuHeader={showMenuHeader}
            onMenuItemClick={onMenuItemClick}
            menusLoading={menuItemsIsLoading}
            menusData={menuItemsData ? menuItemsData?.response_data : []}
          />
        </HiddenOnDesktop>
      )}
      {isBrowsing && (
        <ShowBrowser
          darkMode={darkMode}
          isBrowsing={isBrowsing}
          setIsBrowsing={setIsBrowsing}
        />
      )}
    </>
  );
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  // await queryClient.prefetchQuery(["posts", 1], () => fetchPosts(1));
  await queryClient.prefetchQuery(["menu_location", 1], () =>
    fetchMenuLocation(1)
  );
  await queryClient.prefetchQuery(["menu_items", 1], () => fetchMenuItems(0));

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

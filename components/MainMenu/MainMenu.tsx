import React from "react";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import {
  fetchMenuLocation,
  fetchMenuItems,
  useMenuLocation,
  useMenuItems
} from "../../hooks";
import { MainMenuProps } from "./types";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";

export const MainMenu = (props: MainMenuProps) => {
  const { showMenuHeader, onMenuItemClick, ...others } = props;

  const { data: menuLocationData, isLoading: menuLocationIsLoading } =
    useMenuLocation(1);

  const {
    data: menuItemsData,
    isLoading: menuItemsIsLoading,
    isSuccess: menuItemsIsSuccess
  } = useMenuItems(1);

  if (menuItemsIsLoading || menuLocationIsLoading || !menuItemsData)
    return null;

  const menuItems =
    menuItemsData?.response_data?.menu_location_listing?.length > 0
      ? menuItemsData.response_data.menu_location_listing[0].menu_item_listing
      : [];

  return (
    <>
      {/* Mobile: Sheet slide-out menu */}
      <div className="sm:hidden">
        <MobileMenu
          showMenuHeader={showMenuHeader}
          onMenuItemClick={onMenuItemClick}
          menusLoading={menuItemsIsLoading}
          menusData={menuItemsData ? menuItemsData?.response_data : []}
        />
      </div>

      {/* Desktop: Mega menu */}
      <div className="relative z-[3] hidden shadow-[0_6px_12px_rgba(0,0,0,0.05)] sm:flex">
        {menuItemsIsSuccess ? (
          <MegaMenu menuItems={menuItems} loading={menuItemsIsLoading} />
        ) : null}
      </div>
    </>
  );
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();
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

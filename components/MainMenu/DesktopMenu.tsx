import React, { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { cn } from "@lib/utils";
import { IDesktopMenuProps } from "./types/DesktopMenu";

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

  const [currentKey, setCurrentKey] = useState<any>();

  const handleMouseEnter = useCallback((item: any) => {
    if (timer) {
      clearTimeout(timer);
    }
    setCurrentKey(item.id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timer = setTimeout(() => setCurrentKey(undefined), 300);
  }, []);

  if (menusLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className={cn("relative hidden items-center gap-1 md:flex", pcWrapClassName)}>
      {/* Menu Items */}
      {menuItems?.map((item: any, index: number) => (
        <button
          key={`${index}-1`}
          onMouseEnter={() => handleMouseEnter(item)}
          onMouseLeave={handleMouseLeave}
          onClick={() => item.childrens?.length < 1 && router.push(item.url)}
          className={cn(
            "cursor-pointer border-none bg-transparent px-3 py-2 font-title text-sm font-medium transition-colors",
            "outline-none",
            currentKey === item.id
              ? "text-brand"
              : "text-foreground hover:text-brand"
          )}
        >
          {item.name}
        </button>
      ))}

      {/* Dropdown Menus */}
      {menuItems?.map((item: any, index: number) => {
        if (item.childrens.length) {
          return (
            <div
              key={`${index}-2`}
              onMouseEnter={() => handleMouseEnter(item)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                "absolute left-0 top-full z-50 flex min-w-[200px] gap-4 rounded-xl border border-border/30 bg-card p-5 shadow-lg transition-all",
                currentKey === item.id
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0"
              )}
            >
              {item.childrens?.map((child: any, childIndex: number) => (
                <div key={`${childIndex}-column`} className="flex flex-col">
                  <a
                    href={child.url}
                    className="whitespace-nowrap px-2 py-1.5 font-body text-sm text-foreground transition-colors hover:text-brand"
                  >
                    {child.name}
                  </a>
                </div>
              ))}
              <div className="mx-2 w-px self-stretch bg-border/30" />
              <div className="flex items-center px-2">
                <h3 className="font-title text-sm font-semibold text-brand">
                  On Sale
                </h3>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};
export default DesktopMenu;

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
    return <div className="text-sm text-white/50">Loading...</div>;
  }

  return (
    <div
      className={cn(
        "relative hidden items-center gap-1 md:flex",
        pcWrapClassName
      )}
    >
      {/* Menu Items */}
      {menuItems?.map((item: any, index: number) => (
        <button
          key={`${index}-1`}
          onMouseEnter={() => handleMouseEnter(item)}
          onMouseLeave={handleMouseLeave}
          onClick={() => item.childrens?.length < 1 && router.push(item.url)}
          className={cn(
            "cursor-pointer border-none bg-transparent px-3 py-2 font-title text-sm font-medium transition-all",
            "outline-none",
            currentKey === item.id
              ? "neon-text-cyan"
              : "text-[#e0e0e0] hover:text-neon-cyan hover:[text-shadow:0_0_7px_rgba(0,255,255,0.5)]"
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
                "glass-panel absolute left-0 top-full z-50 flex min-w-[200px] gap-4 p-5 shadow-lg transition-all",
                currentKey === item.id
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0"
              )}
            >
              {item.childrens?.map((child: any, childIndex: number) => (
                <div key={`${childIndex}-column`} className="flex flex-col">
                  <a
                    href={child.url}
                    className="whitespace-nowrap px-2 py-1.5 font-title text-sm text-[#e0e0e0] transition-all hover:text-neon-cyan hover:[text-shadow:0_0_7px_rgba(0,255,255,0.5)]"
                  >
                    {child.name}
                  </a>
                </div>
              ))}
              <div className="mx-2 w-px self-stretch bg-neon-cyan/20" />
              <div className="flex items-center px-2">
                <h3 className="font-title text-sm font-semibold neon-text-cyan">
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

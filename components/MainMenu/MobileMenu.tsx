import React, { Fragment, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@lib/utils";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  ScrollArea
} from "@components/ui";
import { SocialLinks } from "../SocialLinks";
import constants from "../../utilities/constants";

export const MobileMenu = ({
  showMenuHeader,
  onMenuItemClick,
  menusData
}: any) => {
  const router = useRouter();
  const currYear = new Date().getFullYear();
  const [open, setOpen] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const menuItems =
    menusData?.menu_location_listing?.length > 0
      ? menusData?.menu_location_listing[0].menu_item_listing
      : [];

  const toggleExpanded = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleItemClick = (
    item: any,
    hasChildren: boolean,
    pathSlug: string
  ) => {
    if (hasChildren) {
      toggleExpanded(pathSlug);
    } else {
      router.push(item.url);
      setOpen(false);
    }
  };

  const renderMenuItems = (
    menuData: any[],
    parentKeyPath: string,
    level: number
  ) => {
    if (!menuData.length) return null;

    return (
      <div className="flex flex-col">
        {menuData.map((item: any, index: number) => {
          const hasChildren = item.childrens.length > 0;
          const subItems = hasChildren ? item.childrens : [];
          const slug = item.name.toLowerCase();
          const pathSlug = parentKeyPath + "/" + slug;
          const isExpanded = expandedPaths.has(pathSlug);

          return (
            <Fragment key={`${pathSlug}-${index}`}>
              <button
                onClick={() => handleItemClick(item, hasChildren, pathSlug)}
                className={cn(
                  "flex w-full items-center justify-between border-none bg-transparent py-2.5 text-left font-title transition-colors hover:text-neon-cyan",
                  "cursor-pointer outline-none",
                  level === 0 && "text-base text-white",
                  level === 1 && "text-sm text-white/70",
                  level >= 2 && "text-sm text-white/50"
                )}
                style={{ paddingLeft: `${level * 20}px` }}
              >
                <span>{item.name}</span>
                {hasChildren &&
                  (isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-white/50" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/50" />
                  ))}
              </button>
              {hasChildren && isExpanded && (
                <div className="animate-fade-in">
                  {renderMenuItems(subItems, pathSlug, level + 1)}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "fixed left-3 top-[42px] z-[60] flex h-9 w-9 items-center justify-center rounded-md border-none bg-transparent text-white outline-none transition-opacity sm:hidden",
            open && "pointer-events-none opacity-0"
          )}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[66vw] max-w-[320px] p-0 border-r border-glass-border"
        style={{
          background: "rgba(10, 0, 32, 0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)"
        }}
      >
        <SheetHeader className="border-b border-neon-cyan/20 px-6 py-4">
          <SheetTitle className="font-pressstart text-sm text-neon-cyan">
            Menu
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-60px)]">
          <div className="flex flex-col px-6 py-4">
            {menuItems && renderMenuItems(menuItems, "", 0)}

            <hr className="my-4 border-neon-cyan/20" />

            <button
              onClick={() => {
                setOpen(false);
                router.push("/login");
              }}
              className="w-full cursor-pointer border-none bg-transparent py-2.5 text-left font-title text-base text-white transition-colors hover:text-neon-cyan outline-none"
            >
              Login
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/signup");
              }}
              className="w-full cursor-pointer border-none bg-transparent py-2.5 text-left font-title text-base text-white transition-colors hover:text-neon-cyan outline-none"
            >
              Sign Up
            </button>

            <div className="mt-4">
              <SocialLinks />
            </div>

            <div className="mt-8 font-title text-xs text-white/40">
              <div>
                <a
                  href="/privacy"
                  className="text-white/50 hover:text-neon-cyan transition-colors"
                >
                  Privacy Policy
                </a>
                {" - "}
                <a
                  href="/terms"
                  className="text-white/50 hover:text-neon-cyan transition-colors"
                >
                  Terms &amp; Conditions
                </a>
                {" - "}
                <span>RETURN POLICY</span>
              </div>
              <div className="mt-1">
                All Materials Copyright &copy; {currYear} POL Clothing
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

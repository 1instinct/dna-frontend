import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@lib/utils";

interface MenuItem {
  id: string;
  name: string;
  url: string;
  childrens?: MenuItem[];
}

interface MegaMenuProps {
  menuItems: MenuItem[];
  loading?: boolean;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ menuItems, loading }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((menuId: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(menuId);
    setActiveSubmenu(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setActiveMenu(null);
      setActiveSubmenu(null);
    }, 300);
  }, []);

  const handleSubmenuEnter = useCallback((submenuId: string) => {
    setActiveSubmenu(submenuId);
  }, []);

  const closeMenus = useCallback(() => {
    setActiveMenu(null);
    setActiveSubmenu(null);
  }, []);

  // Keyboard: Escape closes the open panel, and so does focus leaving the menu.
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") closeMenus();
  };
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) closeMenus();
  };

  const focusRing =
    "rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const nestedClass = (level: number) =>
    cn(
      "flex cursor-pointer items-center justify-between rounded px-3 py-2 text-sm text-foreground transition-all duration-200 ease-expo-out",
      "hover:translate-x-1 hover:bg-accent hover:text-brand",
      level > 0 && "text-[13px]"
    );
  const nestedStyle = (level: number) => ({
    paddingLeft: level > 0 ? `${12 + level * 16}px` : undefined
  });

  const renderNestedMenu = (items: MenuItem[], level = 0) => {
    return items.map((item) => {
      const hasChildren = item.childrens && item.childrens.length > 0;
      const isActive = activeSubmenu === item.id;

      return (
        <div key={item.id} className="relative">
          {hasChildren ? (
            <button
              type="button"
              onMouseEnter={() => handleSubmenuEnter(item.id)}
              onClick={() => setActiveSubmenu(isActive ? null : item.id)}
              aria-expanded={isActive}
              aria-controls={`megamenu-sub-${item.id}`}
              className={cn(nestedClass(level), "w-full text-left", focusRing)}
              style={nestedStyle(level)}
            >
              {item.name}
              <ChevronRight className="h-4 w-4 opacity-50" aria-hidden="true" />
            </button>
          ) : item.url ? (
            <Link
              href={item.url}
              onClick={closeMenus}
              className={cn(nestedClass(level), focusRing)}
              style={nestedStyle(level)}
            >
              {item.name}
            </Link>
          ) : (
            <span className={nestedClass(level)} style={nestedStyle(level)}>
              {item.name}
            </span>
          )}
          {hasChildren && (
            <div
              id={`megamenu-sub-${item.id}`}
              className={cn(
                "absolute left-full top-0 z-[1001] ml-2 min-w-[200px] rounded-md border bg-popover p-2 shadow-lg transition-all duration-200",
                isActive
                  ? "visible translate-x-0 opacity-100"
                  : "invisible -translate-x-2.5 opacity-0"
              )}
            >
              {renderNestedMenu(item.childrens!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="w-full font-title">
        <div className="shimmer-bg h-12 w-full" />
      </div>
    );
  }

  return (
    // The wrapper only delegates Escape and focus-out for the buttons and links inside it.
    <div
      role="presentation"
      className="relative w-full font-title"
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      {/* Top-level nav items */}
      <nav
        aria-label="Main"
        className="relative flex flex-wrap items-center justify-center gap-10 py-3.5"
      >
        {menuItems.map((item) => {
          const hasChildren = item.childrens && item.childrens.length > 0;
          const isActive = activeMenu === item.id;

          return (
            <TopLevelItem
              key={item.id}
              item={item}
              hasChildren={Boolean(hasChildren)}
              isActive={isActive}
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
              onToggle={() =>
                isActive ? closeMenus() : handleMouseEnter(item.id)
              }
              onNavigate={closeMenus}
              className={cn(
                "relative cursor-pointer px-1 py-2 text-sm font-medium tracking-[0.5px] text-foreground transition-colors duration-200",
                "hover:text-brand",
                "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:bg-brand after:transition-transform after:duration-300",
                isActive ? "after:scale-x-100" : "after:scale-x-0",
                focusRing
              )}
            />
          );
        })}
      </nav>

      {/* Mega dropdowns */}
      {menuItems.map((item) => {
        const hasChildren = item.childrens && item.childrens.length > 0;
        const isActive = activeMenu === item.id;

        if (!hasChildren) return null;

        const itemsPerColumn = 8;
        const columns: MenuItem[][] = [];
        item.childrens!.forEach((child, idx) => {
          const columnIdx = Math.floor(idx / itemsPerColumn);
          if (!columns[columnIdx]) columns[columnIdx] = [];
          columns[columnIdx].push(child);
        });

        return (
          <div
            key={`dropdown-${item.id}`}
            id={`megamenu-${item.id}`}
            onMouseEnter={() => handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "absolute left-0 top-full z-[1000] w-full overflow-y-auto border-t border-border/30 bg-background shadow-lg transition-all duration-300 ease-expo-out",
              isActive
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-2.5 opacity-0",
              "max-h-[600px]"
            )}
          >
            <div
              className="mx-auto grid max-w-[1400px] gap-10 px-10 py-10 md:px-14 lg:px-16"
              style={{
                gridTemplateColumns: `repeat(${Math.min(
                  columns.length + 1,
                  5
                )}, 1fr)`
              }}
            >
              {columns.map((columnItems, colIdx) => (
                <div key={`col-${colIdx}`} className="flex flex-col gap-2">
                  <h4 className="mb-3 border-b border-border/30 pb-2 text-xs font-bold uppercase tracking-[1px] text-brand">
                    {colIdx === 0 ? item.name : "\u00A0"}
                  </h4>
                  <div className="flex flex-col gap-1">
                    {renderNestedMenu(columnItems)}
                  </div>
                </div>
              ))}
              {/* Featured highlight */}
              {columns.length < 4 && (
                <div className="rounded-lg border border-brand/40 bg-gradient-to-br from-brand/[0.08] to-brand-secondary/[0.08] p-5">
                  <h3 className="mb-2 text-base font-bold text-brand">
                    Featured
                  </h3>
                  <p className="m-0 text-[13px] text-muted-foreground">
                    New arrivals &amp; trending items
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface TopLevelItemProps {
  item: MenuItem;
  hasChildren: boolean;
  isActive: boolean;
  className: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggle: () => void;
  onNavigate: () => void;
}

// An item with a panel is a disclosure button; an item without one is a link.
const TopLevelItem = ({
  item,
  hasChildren,
  isActive,
  className,
  onMouseEnter,
  onMouseLeave,
  onToggle,
  onNavigate
}: TopLevelItemProps) => {
  if (hasChildren) {
    return (
      <button
        type="button"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onToggle}
        aria-expanded={isActive}
        aria-controls={`megamenu-${item.id}`}
        className={className}
      >
        {item.name}
      </button>
    );
  }
  if (item.url) {
    return (
      <Link
        href={item.url}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onNavigate}
        className={className}
      >
        {item.name}
      </Link>
    );
  }
  return <span className={className}>{item.name}</span>;
};

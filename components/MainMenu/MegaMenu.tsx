import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useTheme } from "@emotion/react";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import {
  MegaMenuContainer,
  TopLevelNav,
  TopLevelItem,
  MegaDropdown,
  MegaGrid,
  MegaColumn,
  ColumnTitle,
  SubMenuItem,
  SubMenuList,
  NestedIndicator,
  NestedSubMenu,
  HighlightSection
} from "./MegaMenu.styles";

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
  const router = useRouter();
  const theme = useTheme();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((menuId: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
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

  const handleItemClick = (url: string, hasChildren: boolean) => {
    if (!hasChildren && url) {
      setActiveMenu(null);
      setActiveSubmenu(null);
      router.push(url);
    }
  };

  // Recursively render nested submenus
  const renderNestedMenu = (items: MenuItem[], level: number = 0) => {
    return items.map((item) => {
      const hasChildren = item.childrens && item.childrens.length > 0;
      const isActive = activeSubmenu === item.id;

      return (
        <div key={item.id} style={{ position: 'relative' }}>
          <SubMenuItem
            onMouseEnter={() => hasChildren && handleSubmenuEnter(item.id)}
            onClick={() => handleItemClick(item.url, hasChildren || false)}
            hasChildren={hasChildren || false}
            level={level}
          >
            {item.name}
            {hasChildren && (
              <NestedIndicator>
                <ChevronRightIcon fontSize="small" />
              </NestedIndicator>
            )}
          </SubMenuItem>
          {hasChildren && (
            <NestedSubMenu isActive={isActive} level={level}>
              {renderNestedMenu(item.childrens!, level + 1)}
            </NestedSubMenu>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return <MegaMenuContainer>Loading...</MegaMenuContainer>;
  }

  return (
    <MegaMenuContainer>
      <TopLevelNav>
        {menuItems.map((item) => {
          const hasChildren = item.childrens && item.childrens.length > 0;
          const isActive = activeMenu === item.id;

          return (
            <TopLevelItem
              key={item.id}
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleItemClick(item.url, hasChildren || false)}
              isActive={isActive}
              hasChildren={hasChildren || false}
            >
              {item.name}
            </TopLevelItem>
          );
        })}
      </TopLevelNav>

      {menuItems.map((item) => {
        const hasChildren = item.childrens && item.childrens.length > 0;
        const isActive = activeMenu === item.id;

        if (!hasChildren) return null;

        // Group children into columns (max 5 per column)
        const itemsPerColumn = 8;
        const columns: MenuItem[][] = [];
        item.childrens!.forEach((child, idx) => {
          const columnIdx = Math.floor(idx / itemsPerColumn);
          if (!columns[columnIdx]) {
            columns[columnIdx] = [];
          }
          columns[columnIdx].push(child);
        });

        return (
          <MegaDropdown
            key={`dropdown-${item.id}`}
            onMouseEnter={() => handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
            isActive={isActive}
          >
            <MegaGrid columnCount={Math.min(columns.length, 4)}>
              {columns.map((columnItems, colIdx) => (
                <MegaColumn key={`col-${colIdx}`}>
                  <ColumnTitle>{colIdx === 0 ? item.name : ''}</ColumnTitle>
                  <SubMenuList>
                    {renderNestedMenu(columnItems)}
                  </SubMenuList>
                </MegaColumn>
              ))}
              {/* Optional: Featured/Highlight section */}
              {columns.length < 4 && (
                <HighlightSection>
                  <h3>Featured</h3>
                  <p>New arrivals & trending items</p>
                </HighlightSection>
              )}
            </MegaGrid>
          </MegaDropdown>
        );
      })}
    </MegaMenuContainer>
  );
};

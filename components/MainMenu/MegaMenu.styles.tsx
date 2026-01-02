import styled from "@emotion/styled";
import isPropValid from "@emotion/is-prop-valid";

export const MegaMenuContainer = styled.div`
  width: 100%;
  position: relative;
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
`;

export const TopLevelNav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 15px 0;
  position: relative;
  flex-wrap: wrap;
`;

interface TopLevelItemProps {
  isActive: boolean;
  hasChildren: boolean;
}

export const TopLevelItem = styled.div<TopLevelItemProps>`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  cursor: pointer;
  position: relative;
  padding: 8px 4px;
  transition: color 0.2s ease;

  &:hover {
    color: ${(p) => p.theme.colors.brand.primary};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${(p) => p.theme.colors.brand.primary};
    transform: scaleX(${(p) => (p.isActive ? 1 : 0)});
    transition: transform 0.3s ease;
    transform-origin: left;
  }
`;

interface DropdownProps {
  isActive: boolean;
}

export const MegaDropdown = styled.div<DropdownProps>`
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.white.primary};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border-top: 1px solid ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.light
      : p.theme.colors.gray.light};
  z-index: 1000;
  opacity: ${(p) => (p.isActive ? 1 : 0)};
  visibility: ${(p) => (p.isActive ? 'visible' : 'hidden')};
  transform: translateY(${(p) => (p.isActive ? '0' : '-10px')});
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
  max-height: 600px;
  overflow-y: auto;
`;

interface MegaGridProps {
  columnCount: number;
}

export const MegaGrid = styled.div<MegaGridProps>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.columnCount}, 1fr);
  gap: 40px;
  padding: 40px 60px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(${(p) => Math.min(p.columnCount, 3)}, 1fr);
    padding: 30px 40px;
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    padding: 20px 30px;
  }
`;

export const MegaColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ColumnTitle = styled.h4`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${(p) => p.theme.colors.brand.primary};
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.light
      : p.theme.colors.gray.light};
`;

export const SubMenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

interface SubMenuItemProps {
  hasChildren: boolean;
  level: number;
}

export const SubMenuItem = styled.div<SubMenuItemProps>`
  font-size: ${(p) => (p.level === 0 ? '14px' : '13px')};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  padding: ${(p) => (p.level === 0 ? '8px 12px' : '6px 12px 6px ' + (12 + p.level * 16) + 'px')};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background: ${(p) =>
      p.theme.isDarkMode
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.03)'};
    color: ${(p) => p.theme.colors.brand.primary};
    transform: translateX(4px);
  }
`;

export const NestedIndicator = styled.span`
  display: flex;
  align-items: center;
  opacity: 0.5;
`;

interface NestedSubMenuProps {
  isActive: boolean;
  level: number;
}

export const NestedSubMenu = styled.div<NestedSubMenuProps>`
  position: absolute;
  left: 100%;
  top: 0;
  min-width: 200px;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.medium
      : p.theme.colors.white.primary};
  box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 8px;
  margin-left: 8px;
  opacity: ${(p) => (p.isActive ? 1 : 0)};
  visibility: ${(p) => (p.isActive ? 'visible' : 'hidden')};
  transform: translateX(${(p) => (p.isActive ? '0' : '-10px')});
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
  z-index: ${(p) => 1001 + p.level};
`;

export const HighlightSection = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, ${(p) => p.theme.colors.brand.primary}15, ${(p) => p.theme.colors.brand.secondary}15);
  border-radius: 8px;
  border: 1px solid ${(p) => p.theme.colors.brand.primary}40;

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: ${(p) => p.theme.colors.brand.primary};
    margin: 0 0 8px 0;
  }

  p {
    font-size: 13px;
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.medium
        : p.theme.colors.black.medium};
    margin: 0;
  }
`;

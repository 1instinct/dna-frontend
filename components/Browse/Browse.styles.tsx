import styled from "@emotion/styled";
import isPropValid from "@emotion/is-prop-valid";

export const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.dark
      : p.theme.colors.white.primary};

  @media (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    padding: 20px 10px;
  }
`;

export const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;

  @media (max-width: ${(p) => p.theme.breakpoints.values.md}px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

export const FilterSidebar = styled.aside`
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.medium : p.theme.colors.white.medium};
  padding: 24px;
  border-radius: 8px;
  box-shadow: ${(p) =>
    p.theme.isDarkMode
      ? "0 2px 8px rgba(0, 0, 0, 0.5)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};
  height: fit-content;
  position: sticky;
  top: 100px;

  @media (max-width: ${(p) => p.theme.breakpoints.values.md}px) {
    position: static;
    padding: 20px;
  }
`;

export const ProductsArea = styled.main`
  min-height: 400px;
`;

export const FilterSection = styled.div`
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${(p) => p.theme.colors.gray?.light || '#e0e0e0'};

  &:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

export const FilterTitle = styled.h3`
  font-family: ${(p) => p.theme.typography.titleMD.fontFamily};
  font-size: ${(p) => p.theme.typography.titleMD.fontSize};
  font-weight: 600;
  color: ${(p) => p.theme.colors.black.primary};
  margin: 0 0 16px 0;
`;

export const FilterOption = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const FilterCheckbox = styled.input`
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
  accent-color: ${(p) => p.theme.colors.brand.primary};
`;

export const FilterLabel = styled.label`
  font-family: ${(p) => p.theme.typography.bodySM.fontFamily};
  font-size: ${(p) => p.theme.typography.bodySM.fontSize};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.primary
      : p.theme.colors.black.medium};
  margin-left: 10px;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  }
`;

export const SortContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.medium : p.theme.colors.white.medium};
  border-radius: 8px;
  box-shadow: ${(p) =>
    p.theme.isDarkMode
      ? "0 1px 4px rgba(0, 0, 0, 0.5)"
      : "0 1px 4px rgba(0, 0, 0, 0.08)"};

  @media (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  > div {
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

export const SortLabel = styled.span`
  font-family: ${(p) => p.theme.typography.bodySM.fontFamily};
  font-size: ${(p) => p.theme.typography.bodySM.fontSize};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.primary
      : p.theme.colors.black.medium};
  font-weight: 500;
`;

export const SortSelect = styled.select`
  padding: 8px 32px 8px 12px;
  border: 1px solid ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.dark
      : p.theme.colors.gray?.light || '#e0e0e0'};
  border-radius: 6px;
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.dark : p.theme.colors.white.primary};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: ${(p) => p.theme.typography.bodySM.fontFamily};
  font-size: ${(p) => p.theme.typography.bodySM.fontSize};
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${(p) => p.theme.colors.brand.primary};
  }

  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.colors.brand.primary};
    box-shadow: 0 0 0 3px ${(p) => p.theme.colors.brand.primary}20;
  }
`;

export const SearchBar = styled.div`
  width: 100%;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.dark
      : p.theme.colors.gray?.light || '#e0e0e0'};
  border-radius: 6px;
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.dark : p.theme.colors.white.primary};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: ${(p) => p.theme.typography.bodySM.fontFamily};
  font-size: ${(p) => p.theme.typography.bodySM.fontSize};
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.primary
        : p.theme.colors.gray.medium};
  }

  &:hover {
    border-color: ${(p) => p.theme.colors.brand.primary};
  }

  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.colors.brand.primary};
    box-shadow: 0 0 0 3px ${(p) => p.theme.colors.brand.primary}20;
  }
`;

export const ClearFiltersButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  background: transparent;
  color: ${(p) => p.theme.colors.brand.primary};
  border: 1px solid ${(p) => p.theme.colors.brand.primary};
  border-radius: 6px;
  font-family: ${(p) => p.theme.typography.bodySM.fontFamily};
  font-size: ${(p) => p.theme.typography.bodySM.fontSize};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;

  &:hover {
    background: ${(p) => p.theme.colors.brand.primary};
    color: ${(p) => p.theme.colors.white.primary};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${(p) => p.theme.colors.brand.primary}40;
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ResultsCount = styled.div`
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
  font-size: ${(p) => p.theme.typography.bodyMD.fontSize};
  color: ${(p) => p.theme.colors.black.primary};
  font-weight: 600;
`;

export const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.medium : p.theme.colors.white.medium};
  border-radius: 8px;

  h2 {
    font-family: ${(p) => p.theme.typography.titleLG.fontFamily};
    font-size: ${(p) => p.theme.typography.titleLG.fontSize};
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
    margin: 0 0 12px 0;
  }

  p {
    font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
    font-size: ${(p) => p.theme.typography.bodyMD.fontSize};
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.primary
        : p.theme.colors.gray.medium};
    margin: 0 0 24px 0;
  }
`;

export const PriceInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  span {
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.primary
        : p.theme.colors.gray.medium};
    font-weight: 500;
  }
`;

export const PriceInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.dark
      : p.theme.colors.gray?.light || '#e0e0e0'};
  border-radius: 6px;
  background: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.dark : p.theme.colors.white.primary};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: ${(p) => p.theme.typography.bodySM.fontFamily};
  font-size: ${(p) => p.theme.typography.bodySM.fontSize};
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${(p) => p.theme.colors.brand.primary};
  }

  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.colors.brand.primary};
    box-shadow: 0 0 0 3px ${(p) => p.theme.colors.brand.primary}20;
  }

  /* Remove spinner arrows in Chrome, Safari, Edge */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Remove spinner arrows in Firefox */
  &[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
`;

export const ApplyPriceButton = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: ${(p) => p.theme.colors.brand.primary};
  color: ${(p) => p.theme.colors.white.primary};
  border: none;
  border-radius: 6px;
  font-family: ${(p) => p.theme.typography.bodySM.fontFamily};
  font-size: ${(p) => p.theme.typography.bodySM.fontSize};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(p) => p.theme.colors.brand.secondary};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${(p) => p.theme.colors.brand.primary}40;
  }

  &:active {
    transform: translateY(0);
  }
`;

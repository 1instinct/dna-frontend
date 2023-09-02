import styled from "@emotion/styled";

export interface StyledAutoCompleteProps {
  theme?: {
    colors: {
      blue: { primary: string };
      gray: { background: string };
    };
  };
}
export const StyledAutoComplete = styled.div<StyledAutoCompleteProps>`
  position: absolute;
  display: block;
  width: 100%;
  max-height: 245px;

  background: white;
  border-radius: 0px 0px 3px 3px;
  box-shadow: 0 7px 13px 1px rgba(24, 41, 60, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 20px;
    border-radius: 0 0 3px 0;
    background-color: ${(p) =>
      p.theme.isDarkMode ? p.theme.colors.black.light : p.theme.colors.white.light};
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 12px;
    height: 80px;
    background-color: ${(p) =>
      p.theme.isDarkMode ? p.theme.colors.black.medium : p.theme.colors.white.medium};
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.33);
    transition: 1s all ease-in-out;
    &:active {
      transition: 1s all ease-in-out;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.22);
    }
  }

  &::-webkit-scrollbar-track {
    border-radius: 8px;
    background-color: ${(p) =>
      p.theme.isDarkMode ? p.theme.colors.gray.dark : p.theme.colors.gray.light};
  }
`;
export interface StyledSuggestionLinkProps {
  theme?: {
    colors: {
      blue: {
        primary: string;
      };
      gray: {
        background: string;
      };
    };
  };
}
export const StyledSuggestionLink = styled.div<StyledSuggestionLinkProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 12px 30px;
  background-color: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.black.primary : p.theme.colors.white.primary};
  color: ${(p) =>
    p.theme.isDarkMode ? p.theme.colors.white.primary : p.theme.colors.black.primary};

  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;

  &:hover {
    text-decoration: none;
    background-color: ${(p) =>
      p.theme.isDarkMode ? p.theme.colors.gray.medium : p.theme.colors.gray.primary};
    color: ${(p) =>
      p.theme.isDarkMode ? p.theme.colors.white.primary : p.theme.colors.black.primary};
  }

  mark {
    font-weight: 400;
  }
`;

export const StyledSuggestionContent = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

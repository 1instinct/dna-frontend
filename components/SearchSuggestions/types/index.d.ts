export * from "./SearchSuggestions";
export interface SearchSuggestionsProps {
  id?: string;
  labelId?: string;
  isVisible?: boolean;
  setIsSearchLoading: (e) => void;
  toggleVisibility: (e) => void;
  onSelect: (e) => void;
  query?: string;
}

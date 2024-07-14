import React, {
  useState,
  useEffect,
  createRef,
  useRef,
  useCallback,
  KeyboardEvent,
  MouseEvent,
  TouchEvent
} from "react";
import {
  StyledSearch,
  StyledInputContainer,
  SearchInputWrapper,
  StyledInput,
  StyledIcon,
  StyledInputPrefix,
  StyledInputPostfix,
  SearchButton,
  BrowseButton,
  SearchBarWrapper,
  ButtonWrapper
} from "./SearchBar.styles";
import AutoComplete from "../SearchSuggestions";
import { useRouter } from "next/router";
import { useOnClickOutside } from "../../hooks";
import { SearchBarProps } from "./types";
import * as tracking from "../../config/tracking";
import { Search } from "@material-ui/icons";

const SearchBar = ({
  darkMode,
  placeholder = "Search...",
  autoComplete = true,
  value = "",
  ...rest
}: SearchBarProps) => {
  const router = useRouter();
  const [query, setQuery] = useState(value);
  const [isAutoCompleteVisible, setIsAutocompleteVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWidthSet, setIsWidthSet] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  // const [isSearchInputFocusable, setIsSearchInputFocusable] = useState(false);

  const handleSearchChange = (e: any) => {
    const { value } = e.target;
    if (value.length === 0) handleSearchClear();
    setQuery(value);
    setIsAutocompleteVisible(true);
  };

  const handleSearchClear = () => {
    setQuery("");
    setIsAutocompleteVisible(false);
  };

  const { ref: dropdownRef } = useCustomRef<HTMLDivElement>();

  const handleClickOutside = useCallback((event: Event) => {
    const someNode = event.target as Node;
    if (dropdownRef.current && !dropdownRef.current?.contains(someNode)) {
      setIsAutocompleteVisible(false);
    }
  }, []);

  useOnClickOutside(dropdownRef, handleClickOutside);

  useEffect(() => {
    // !isSearchInputFocusable && setIsSearchInputFocusable(!isSearchInputFocusable);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const keyboardEvents = (event: KeyboardEvent) => {
    // TO DO: handle UP & DOWN keys
    switch (event.key) {
      case "Escape":
      case "Tab":
        setIsAutocompleteVisible(false);
        break;
      case "Enter":
        if (query.length > 3) {
          if (event.key === "Enter" && query.length > 3) {
            tracking.trackEvent({
              action: tracking.Action.PRESS_ENTER,
              category: tracking.Category.SEARCH_BAR,
              label: query
            });

            router.push(`/search?term=${query}`);
          }
        }
        break;

      default:
        break;
    }
  };

  const selectSuggestion = (suggestion: string) => {
    tracking.trackEvent({
      action: tracking.Action.SELECT_SUGGESTION,
      category: tracking.Category.SEARCH_BAR,
      label: suggestion
    });

    setQuery(suggestion);
  };

  // Wait to set search width until exanding animation (0.33s) completes
  const handleSetSearchWidth = () =>
    setTimeout(() => {
      setIsWidthSet(!isWidthSet);
    }, 330);

  // Open Search, unless open then close/hide everything and remove explicit search width
  const searchRef = createRef<HTMLInputElement>();

  const toggleSearch = () => {
    const currSearchElement = searchRef.current!;
    if (currSearchElement) {
      currSearchElement.focus();
    }
    setIsExpanded(!isExpanded);
    isWidthSet ? setIsWidthSet(!isWidthSet) : handleSetSearchWidth();
    setQuery("");
    isAutoCompleteVisible && setIsAutocompleteVisible(!isAutoCompleteVisible);
  };

  const labelId = "label-search";
  const dropdownId = "dropdown-search";

  return (
    <StyledSearch
      role="combobox"
      aria-haspopup="listbox"
      aria-owns="search"
      aria-expanded={isAutoCompleteVisible}
      ref={dropdownRef}
      aria-labelledby={labelId}
      {...rest}
    >
      <SearchBarWrapper className="is-search-route">
        <SearchInputWrapper>
          <StyledInputContainer isExpanded={isExpanded} isWidthSet={isWidthSet}>
            <StyledInputPrefix darkMode={darkMode}>
              <i
                onClick={toggleSearch}
                className={
                  isSearchLoading ? "bts bt-spinner bt-pulse" : "btr bt-search"
                }
              ></i>
            </StyledInputPrefix>
            <StyledInput
              darkMode={!darkMode}
              ref={searchRef}
              onKeyDown={(e: KeyboardEvent) => keyboardEvents(e)}
              tabIndex={0}
              value={query}
              placeholder={placeholder}
              onChange={handleSearchChange}
              id="search"
              aria-controls={dropdownId}
              aria-labelledby={labelId}
              role="textbox"
              autoComplete="off"
            />
            {query && (
              <StyledInputPostfix
                onClick={handleSearchClear}
                darkMode={darkMode}
              >
                <i className="btr bt-times"></i>
              </StyledInputPostfix>
            )}
          </StyledInputContainer>
        </SearchInputWrapper>
        {/* <ButtonWrapper>
          <BrowseButton>Search</BrowseButton>
        </ButtonWrapper> */}
      </SearchBarWrapper>

      {autoComplete ? (
        <AutoComplete
          setIsSearchLoading={(e) => setIsSearchLoading(e)}
          isVisible={isAutoCompleteVisible}
          toggleVisibility={(e: any) => setIsAutocompleteVisible(e)}
          id={dropdownId}
          labelId={labelId}
          onSelect={(e: any) => selectSuggestion(e)}
          query={query}
        />
      ) : null}
    </StyledSearch>
  );
};

const useCustomRef = <T extends HTMLElement>() => {
  const myRef = useRef<T>(null);

  return { ref: myRef };
};

export default SearchBar;

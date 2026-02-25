import React, {
  useState,
  useEffect,
  createRef,
  useRef,
  useCallback,
  KeyboardEvent
} from "react";
import AutoComplete from "../SearchSuggestions";
import { useRouter } from "next/router";
import { useOnClickOutside } from "../../hooks";
import { SearchBarProps } from "./types";
import * as tracking from "../../config/tracking";
import { Search, X } from "lucide-react";
import { cn } from "@lib/utils";

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
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const keyboardEvents = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Escape":
      case "Tab":
        setIsAutocompleteVisible(false);
        break;
      case "Enter":
        if (query.length > 3) {
          tracking.trackEvent({
            action: tracking.Action.PRESS_ENTER,
            category: tracking.Category.SEARCH_BAR,
            label: query
          });
          router.push(`/search?term=${query}`);
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

  const handleSetSearchWidth = () =>
    setTimeout(() => {
      setIsWidthSet(!isWidthSet);
    }, 330);

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
    <div
      role="combobox"
      aria-haspopup="listbox"
      aria-owns="search"
      aria-expanded={isAutoCompleteVisible}
      ref={dropdownRef}
      aria-labelledby={labelId}
      className="relative"
      {...rest}
    >
      <div className="is-search-route flex flex-row justify-between">
        <div className="flex w-full justify-end">
          <div
            className={cn(
              "relative inline-block transition-all duration-300 ease-in-out",
              isExpanded ? "w-[195px]" : "w-0"
            )}
          >
            <div
              className="absolute left-0 top-0 z-[3] flex h-full w-11 cursor-pointer items-center justify-start"
              onClick={toggleSearch}
            >
              {isSearchLoading ? (
                <i className="bts bt-spinner bt-pulse" />
              ) : (
                <Search className="h-4 w-4 text-foreground" />
              )}
            </div>
            <input
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
              className={cn(
                "h-[42px] w-full border-0 bg-transparent font-title text-sm font-normal text-foreground caret-foreground outline-none transition-all duration-300 ease-in-out",
                isExpanded
                  ? "border-b border-foreground px-[26px] pl-[30px]"
                  : "pl-0",
                isWidthSet ? "w-[140px]" : "w-full"
              )}
            />
            {query && (
              <div
                onClick={handleSearchClear}
                className="absolute right-[5px] top-0 z-[3] flex h-full w-11 cursor-pointer items-center justify-end text-foreground transition-colors hover:text-brand"
              >
                <X className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
};

const useCustomRef = <T extends HTMLElement>() => {
  const myRef = useRef<T>(null);
  return { ref: myRef };
};

export default SearchBar;

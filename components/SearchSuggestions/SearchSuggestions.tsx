import React, { useEffect, useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import Suggestion from "./Suggestion";
import { SearchSuggestionsProps } from "./types";

const SearchSuggestions = ({
  id,
  labelId,
  isVisible,
  setIsSearchLoading,
  toggleVisibility,
  onSelect,
  query
}: SearchSuggestionsProps) => {
  const {
    error,
    status,
    data,
    isLoading,
    isSuccess
  }: {
    error: any;
    status: any;
    data: any;
    isLoading: boolean;
    isSuccess: boolean;
  } = useProducts(1);
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState([]);

  // The parent shows a spinner while suggestions load. Set it from an effect, not during render.
  useEffect(() => {
    setIsSearchLoading(isVisible && isLoading);
  }, [isVisible, isLoading, setIsSearchLoading]);

  if (!isVisible) return null;

  const wrapperClass =
    "absolute z-10 block w-full max-h-[245px] overflow-y-auto overflow-x-hidden rounded-b-xl bg-card shadow-lg";

  if (isLoading) {
    return (
      <div className={wrapperClass} role="status" id={id}>
        <span className="sr-only">Loading suggestions</span>
        <div className="flex items-center justify-center py-4">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-brand"
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={wrapperClass} role="alert" id={id}>
        <p className="px-4 py-3 text-sm text-destructive">
          Suggestions couldn&apos;t load ({status}).
        </p>
      </div>
    );
  }

  if (!data || data.data.length === 0) return null;

  return (
    <ul className={wrapperClass} aria-labelledby={labelId} id={id}>
      {isVisible &&
        data?.data?.map((item: any, index: any) => {
          return (
            <li key={`${item.id}-${index}`}>
              <Suggestion
                suggestion={item}
                toggleVisibility={(e: any) => toggleVisibility(e)}
                onChange={(e: any) => onSelect(e)}
                query={query}
              />
            </li>
          );
        })}
    </ul>
  );
};

export default SearchSuggestions;

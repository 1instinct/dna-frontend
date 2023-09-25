import React, { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { LoadingIcon } from "..";
import { useProducts } from "../../hooks/useProducts";
import { StyledSearchSuggestions } from "./SearchSuggestions.styles";
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
  // const [error, setError] = useState('');

  useEffect(() => {
    // getSearchData();
    // data ? console.log("stuff: ", data) : null;
    // console.log("suggestions: ", suggestions, "data: ", data);
  }, []);

  if (!isVisible) return null;

  if (isLoading) {
    setIsSearchLoading();
    return (
      <StyledSearchSuggestions role="listbox" aria-labelledby={labelId} id={id}>
        <LoadingIcon className="bts bt-spinner bt-pulse" />
      </StyledSearchSuggestions>
    );
  }

  if (error) {
    return (
      <StyledSearchSuggestions role="listbox" aria-labelledby={labelId} id={id}>
        <p>Error {status}</p>
      </StyledSearchSuggestions>
    );
  }

  if (!data || data.data.length === 0) return null;

  return (
    <StyledSearchSuggestions role="listbox" aria-labelledby={labelId} id={id}>
      {isVisible &&
        data?.data?.map((item: any, index: any) => {
          return (
            <Suggestion
              suggestion={item}
              key={`${item.id}-${index}`}
              toggleVisibility={(e: any) => toggleVisibility(e)}
              onChange={(e: any) => onSelect(e)}
              query={query}
            />
          );
        })}
    </StyledSearchSuggestions>
  );
};

export default SearchSuggestions;

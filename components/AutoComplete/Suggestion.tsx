import React from "react";
import Router from "next/router";
import { nanoid } from "nanoid";
import { IProduct } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
// import { useDispatch } from 'react-redux';
// import { commonOperations } from '@common/ducks';
import {
  StyledSuggestionLink,
  StyledSuggestionContent
} from "./AutoComplete.styles";

const formatWithHighlight = (text: string, query: string | undefined) => {
  if (!query) return text;

  const sanitizeString = (str: any) => {
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, "");
    return str.trim();
  };

  const reg = new RegExp(`(${sanitizeString(query)})`, "gi");
  const textParts = text.split(reg);

  return textParts.map((part: any) =>
    part.match(reg) ? (
      part
    ) : (
      <span key={nanoid()} style={{ fontWeight: "normal" }}>
        {part}
      </span>
    )
  );
};

type OwnProps = {
  suggestion?: any;
  query?: string;
  onChange: (e: any) => void;
  toggleVisibility: (e: any) => void;
};

const Suggestion = ({
  suggestion,
  query,
  onChange,
  toggleVisibility
}: OwnProps) => {
  // const Suggestion = ({ suggestion, query, onChange, toggleVisibility }) => {
  const handleSelection = () => {
    onChange("");
    toggleVisibility(false);
    Router.push(`/${suggestion.attributes.slug}?id=${suggestion.id}`);
  };

  // const dispatch = useDispatch();
  if (suggestion) {
    return (
      <StyledSuggestionLink onClick={() => handleSelection()}>
        <StyledSuggestionContent>
          {formatWithHighlight(suggestion.attributes.name, query)}
        </StyledSuggestionContent>
      </StyledSuggestionLink>
    );
  } else {
    return <></>;
  }
};

export default Suggestion;

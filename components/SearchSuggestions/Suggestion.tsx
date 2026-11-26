import React from "react";
import Link from "next/link";
import { nanoid } from "nanoid";

const formatWithHighlight = (text: string, query: string | undefined) => {
  if (!query) return text;

  const sanitizeString = (str: any) => {
    str = str.replace(/[^a-z0-9áéíóúñü .,_-]/gim, "");
    return str.trim();
  };

  const reg = new RegExp(`(${sanitizeString(query)})`, "gi");
  const textParts = text.split(reg);
  return textParts.map((part: any) =>
    part.match(reg) ? (
      part
    ) : (
      <span key={nanoid()} className="font-normal">
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
  // A link, so keyboard users can Tab to it and it opens in a new tab like any link.
  const handleSelection = () => {
    onChange("");
    toggleVisibility(false);
  };

  if (suggestion) {
    return (
      <Link
        href={`/${suggestion.attributes.slug}`}
        onClick={handleSelection}
        className="flex cursor-pointer items-center justify-between bg-card px-8 py-3 font-title text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {formatWithHighlight(suggestion.attributes.name, query)}
        </span>
      </Link>
    );
  } else {
    return <></>;
  }
};

export default Suggestion;

import React from "react";
import { useRouter } from "next/router";
import { nanoid } from "nanoid";

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
  const router = useRouter();
  const handleSelection = (e: any) => {
    onChange("");
    e.preventDefault();
    toggleVisibility(false);
    router.push(`/${suggestion.attributes.slug}`);
  };

  if (suggestion) {
    return (
      <div
        onClick={handleSelection}
        className="flex cursor-pointer items-center justify-between bg-card px-8 py-3 font-title text-sm font-bold text-foreground transition-colors hover:bg-muted"
      >
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          {formatWithHighlight(suggestion.attributes.name, query)}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default Suggestion;

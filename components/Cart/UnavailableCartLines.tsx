import React from "react";
import { UnavailableLine } from "../../lib/cartAvailability";

interface Props {
  lines: UnavailableLine[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

/** Names the cart lines that can't be bought, each with a way to remove it. */
export const UnavailableCartLines = ({ lines, onRemove, disabled }: Props) => {
  if (lines.length === 0) return null;
  return (
    <div
      role="alert"
      className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 font-body text-sm text-destructive"
    >
      <p>
        {lines.length === 1
          ? "This item is no longer available. Remove it to check out."
          : "These items are no longer available. Remove them to check out."}
      </p>
      <ul className="mt-2 space-y-1">
        {lines.map((line) => (
          <li key={line.id} className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-foreground">
              {line.name}
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRemove(line.id)}
              aria-label={`Remove ${line.name}`}
              className="shrink-0 border-none bg-transparent text-xs text-destructive underline disabled:opacity-50"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

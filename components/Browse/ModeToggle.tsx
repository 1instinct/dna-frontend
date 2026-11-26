import React from "react";
import { useRouter } from "next/router";
import { cn } from "@lib/utils";

export type BrowseMode = "shop" | "marketplace";

const MODES: { id: BrowseMode; label: string }[] = [
  { id: "shop", label: "Shop" },
  { id: "marketplace", label: "Marketplace" }
];

/** Switches /browse between the store's products and the marketplace. */
export const ModeToggle: React.FC<{ mode: BrowseMode; className?: string }> = ({
  mode,
  className
}) => {
  const router = useRouter();
  const go = (next: BrowseMode) => {
    if (next === mode) return;
    router.push(
      { pathname: "/browse", query: next === "shop" ? {} : { mode: next } },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div
      role="group"
      aria-label="Browse"
      className={cn(
        "inline-flex rounded-lg border border-border/30 bg-card p-1",
        className
      )}
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          aria-pressed={mode === m.id}
          onClick={() => go(m.id)}
          className={cn(
            "rounded-md px-4 py-1.5 font-title text-xs font-semibold uppercase tracking-wider transition-colors",
            mode === m.id
              ? "bg-brand text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
};

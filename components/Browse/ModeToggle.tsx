import React from "react";
import { useRouter } from "next/router";
import { cn } from "@lib/utils";

export type BrowseMode = "shop" | "marketplace";

interface ModeToggleProps {
  mode: BrowseMode;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode }) => {
  const router = useRouter();

  const handleModeChange = (newMode: BrowseMode) => {
    if (newMode === mode) return;
    router.push(
      {
        pathname: "/browse",
        query: { ...router.query, mode: newMode }
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleModeChange("shop")}
        className={cn(
          "rounded-lg px-5 py-2.5 font-pressstart text-xs tracking-wider transition-all duration-300 uppercase",
          mode === "shop"
            ? "bg-neon-cyan/20 border border-neon-cyan text-neon-cyan neon-text-cyan shadow-[0_0_12px_rgba(0,255,255,0.25)]"
            : "glass-panel text-white/50 hover:text-white/70 hover:bg-white/[0.08]"
        )}
      >
        SHOP
      </button>
      <button
        onClick={() => handleModeChange("marketplace")}
        className={cn(
          "rounded-lg px-5 py-2.5 font-pressstart text-xs tracking-wider transition-all duration-300 uppercase",
          mode === "marketplace"
            ? "bg-neon-magenta/20 border border-neon-magenta text-neon-magenta neon-text-magenta shadow-[0_0_12px_rgba(255,0,255,0.25)]"
            : "glass-panel text-white/50 hover:text-white/70 hover:bg-white/[0.08]"
        )}
      >
        MARKETPLACE
      </button>
    </div>
  );
};

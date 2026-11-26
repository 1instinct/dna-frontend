import React from "react";
import type { AppLink } from "@lib/appLinks";

// Official store badge artwork is not in the repo, so every link renders as a
// text button. A fork that adds compliant badges renders them in the "store"
// branch.
const renderLink = (link: AppLink) => {
  const key = `${link.platform}-${link.kind}-${link.href}`;
  switch (link.kind) {
    case "store":
    // fall through: no badge artwork
    case "beta":
    default:
      return (
        <a
          key={key}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 font-title text-sm font-semibold text-white no-underline transition-colors hover:bg-brand/90"
        >
          {link.label}
        </a>
      );
  }
};

export const AppStoreButtons: React.FC<{ links: AppLink[] }> = ({ links }) => {
  if (!links || links.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {links.map(renderLink)}
    </div>
  );
};

export default AppStoreButtons;

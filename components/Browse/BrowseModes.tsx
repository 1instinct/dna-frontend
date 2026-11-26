import React from "react";
import { useRouter } from "next/router";
import { marketplaceEnabled } from "../../lib/marketplace";
import { Browse } from "./Browse";
import { MarketplaceBrowse } from "./MarketplaceBrowse";

/**
 * /browse: the store's products, or with ?mode=marketplace (when the
 * marketplace is on) the creator marketplace.
 */
export const BrowseModes: React.FC = () => {
  const router = useRouter();
  return marketplaceEnabled() && router.query.mode === "marketplace" ? (
    <MarketplaceBrowse />
  ) : (
    <Browse />
  );
};

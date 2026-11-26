import React from "react";
import Link from "next/link";
import { FileDown } from "lucide-react";
import { MediaItem } from "@lib/productMedia";
import { ProductMedia } from "@components/ProductMedia";
import { Badge } from "@components/ui";
import { digitalKindOf, kindLabel } from "../../lib/digitalKinds";
import { creatorOf } from "../../lib/marketplace";

/** A storefront v2 product (JSON:API resource) in the marketplace taxon. */
export type MarketplaceProduct = {
  type: string;
  id: string;
  attributes?: Record<string, any>;
};

const priceLabel = (attrs: Record<string, any>): string => {
  const n = parseFloat(attrs.price ?? "");
  if (Number.isFinite(n) && n === 0) return "Free";
  return attrs.display_price || (Number.isFinite(n) ? n.toFixed(2) : "");
};

/** A digital product in the marketplace grid: media, kind, price, creator. */
export const MarketplaceCard: React.FC<{
  product: MarketplaceProduct;
  media?: MediaItem | null;
}> = ({ product, media = null }) => {
  const attrs = product.attributes || {};
  const kind = digitalKindOf(product);
  const creator = creatorOf(product);

  return (
    <div className="group overflow-hidden rounded-xl border border-border/30 bg-card ring-offset-background transition-all hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2">
      <Link
        href={`/${attrs.slug}`}
        className="block no-underline focus-visible:outline-none"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <ProductMedia
            media={media}
            surface="grid"
            decorative
            className="absolute inset-0"
            mediaClassName="h-full w-full object-cover"
            placeholder={
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <FileDown className="h-8 w-8" aria-hidden />
              </div>
            }
          />
          {kind && (
            <Badge variant="secondary" className="absolute left-3 top-3">
              {kindLabel(kind)}
            </Badge>
          )}
          <Badge className="absolute right-3 top-3 tabular-nums">
            {priceLabel(attrs)}
          </Badge>
        </div>
        <div className="px-4 pt-3">
          <h3 className="truncate font-title text-sm font-semibold text-foreground">
            {attrs.name}
          </h3>
        </div>
      </Link>
      <div className="truncate px-4 pb-4 pt-0.5 font-body text-xs text-muted-foreground">
        {creator ? `by ${creator.name}` : " "}
      </div>
    </div>
  );
};

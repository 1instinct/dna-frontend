import React from "react";
import { cn } from "@lib/utils";

interface ProductThumbProps {
  name: string;
  imageUrl?: string | null;
  detail?: React.ReactNode;
  className?: string;
}

/** Small product image + name + detail line (variant, order). */
export const ProductThumb = ({
  name,
  imageUrl,
  detail,
  className
}: ProductThumbProps) => (
  <div className={cn("flex min-w-0 items-center gap-3", className)}>
    {imageUrl ? (
      <img
        src={imageUrl}
        alt=""
        className="h-[54px] w-11 shrink-0 rounded-md bg-muted object-cover"
      />
    ) : (
      <span
        aria-hidden="true"
        className="h-[54px] w-11 shrink-0 rounded-md bg-gradient-to-br from-brand-secondary to-brand"
      />
    )}
    <div className="grid min-w-0">
      <span className="truncate font-body-bold text-sm text-foreground">
        {name}
      </span>
      {detail && (
        <span className="truncate font-body text-xs text-muted-foreground">
          {detail}
        </span>
      )}
    </div>
  </div>
);

export default ProductThumb;

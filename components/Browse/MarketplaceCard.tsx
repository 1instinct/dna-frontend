import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@lib/utils";

export interface MarketplaceProduct {
  name: string;
  slug: string;
  price: string;
  type: string;
  compatibility?: string;
  format?: string;
  fileCount?: string;
}

interface MarketplaceCardProps {
  product: MarketplaceProduct;
  index?: number;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  product,
  index = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link href={`/${product.slug}`} className="group block no-underline">
        <div
          className={cn(
            "glass-panel relative overflow-hidden rounded-xl transition-all duration-300",
            "group-hover:scale-[1.02] group-hover:border-neon-magenta/40",
            "group-hover:shadow-[0_0_20px_rgba(255,0,255,0.15)]"
          )}
        >
          {/* Artwork area - landscape aspect ratio */}
          <div className="relative aspect-[16/9] w-full bg-surface-deep">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Placeholder gradient artwork */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-magenta/10 via-surface-deep to-neon-cyan/10" />
              <span className="relative font-pressstart text-lg text-white/20">
                {product.type === "Sample Packs" && "♫"}
                {product.type === "Synths" && "◈"}
                {product.type === "Visualizers" && "◉"}
              </span>
            </div>

            {/* Type badge */}
            <div className="absolute left-3 top-3">
              <span className="glass-panel inline-block rounded-full px-3 py-1 font-title text-[10px] uppercase tracking-wider text-white/80">
                {product.type}
              </span>
            </div>

            {/* Price badge */}
            <div className="absolute right-3 top-3">
              <span className="inline-block rounded-md bg-neon-cyan/20 border border-neon-cyan/40 px-2.5 py-1 font-title text-xs font-semibold text-neon-cyan">
                {product.price}
              </span>
            </div>
          </div>

          {/* Info section */}
          <div className="p-4">
            <h3 className="mb-1.5 font-title text-sm font-bold text-white truncate">
              {product.name}
            </h3>

            {/* Metadata line */}
            <div className="flex items-center gap-3 text-[11px] text-gray-400 font-title">
              {product.format && <span>{product.format}</span>}
              {product.fileCount && (
                <>
                  {product.format && <span className="text-white/20">·</span>}
                  <span>{product.fileCount}</span>
                </>
              )}
              {product.compatibility && (
                <>
                  {(product.format || product.fileCount) && (
                    <span className="text-white/20">·</span>
                  )}
                  <span>{product.compatibility}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

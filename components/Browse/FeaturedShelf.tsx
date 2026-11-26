import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@lib/utils";
import {
  hasMsrp,
  isPreorder,
  JsonApiResource,
  pickGridMedia
} from "@lib/productMedia";
import { ProductMedia } from "@components/ProductMedia";
import { CardMediaPlaceholder } from "@components/ProductCard/ProductCard";

interface FeaturedShelfProps {
  /** Featured taxon products ({ data, included }) in admin order. */
  featured: { data: JsonApiResource[]; included?: JsonApiResource[] };
}

const priceOf = (p: JsonApiResource) => {
  const a = p.attributes || {};
  return {
    price: a.display_price || (a.price ? `$${a.price}` : ""),
    msrp: hasMsrp(a.price, a.compare_at_price)
      ? a.display_compare_at_price || `$${a.compare_at_price}`
      : null
  };
};

/** Strip tags from Spree descriptions (they may hold HTML). */
const plain = (html: unknown): string =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const PreorderBadge: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={cn(
      "absolute rounded-md bg-primary px-2 py-1 font-title text-[10px] uppercase tracking-wider text-primary-foreground",
      className
    )}
  >
    Pre-order
  </span>
);

/**
 * The first featured product as a large hero, the rest as a row. Rendered by
 * Browse above the product grid only when nothing is filtered or searched.
 */
export const FeaturedShelf: React.FC<FeaturedShelfProps> = ({ featured }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SPREE_API_URL || "";
  const [hero, ...rest] = featured.data;
  if (!hero) return null;

  const heroMedia = pickGridMedia(hero, featured.included, {
    baseUrl,
    posterWidth: 1000
  });
  const heroPreorder = isPreorder(hero, featured.included);
  const { price, msrp } = priceOf(hero);
  const heroHref = `/${hero.attributes?.slug}`;
  const blurb = plain(hero.attributes?.description);

  return (
    <motion.section
      aria-label="Featured"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
      className="mb-10"
    >
      {/* Section label */}
      <div className="mb-4 flex items-center gap-3">
        <span className="font-title text-xs uppercase tracking-widest text-foreground">
          Featured
        </span>
        <span className="h-px flex-1 bg-border" />
        <span className="font-body text-sm text-muted-foreground">
          {String(featured.data.length).padStart(2, "0")}
        </span>
      </div>

      {/* Hero */}
      <Link
        href={heroHref}
        className="group relative block overflow-hidden rounded-xl border border-border/30 bg-card no-underline shadow-sm transition-all duration-500 hover:shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Media */}
          <div className="relative md:col-span-7 md:min-h-[440px]">
            <ProductMedia
              media={heroMedia}
              surface="grid"
              priority
              decorative
              className={cn(
                "relative w-full overflow-hidden md:absolute md:inset-0 md:aspect-auto md:h-full",
                // 4:3 on phones keeps the price and CTA near the first
                // screen; no media: a shorter frame, not a big empty box.
                heroMedia ? "aspect-[4/3] sm:aspect-[16/10]" : "aspect-[16/9]"
              )}
              mediaClassName="h-full w-full object-cover transition-transform duration-700 ease-expo-out group-hover:scale-[1.03]"
              placeholder={<CardMediaPlaceholder />}
            />
            {heroPreorder && <PreorderBadge className="left-4 top-4 z-[2]" />}
          </div>

          {/* Copy */}
          <div className="relative flex flex-col justify-center gap-5 border-t border-border/30 p-6 sm:p-8 md:col-span-5 md:border-l md:border-t-0 lg:p-10">
            <h2 className="font-title text-xl leading-relaxed text-foreground sm:text-2xl">
              {hero.attributes?.name}
            </h2>

            {blurb && (
              <p className="line-clamp-3 font-body text-sm leading-relaxed text-muted-foreground">
                {blurb}
              </p>
            )}

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-title text-3xl text-foreground sm:text-4xl">
                {price}
              </span>
              {msrp && (
                <span className="font-body text-sm text-muted-foreground">
                  <span className="line-through">{msrp}</span> MSRP
                </span>
              )}
            </div>

            <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 font-title text-sm font-semibold text-white transition-colors group-hover:bg-brand/90 sm:w-fit">
              {heroPreorder ? "Reserve now" : "View product"}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>

      {/* The rest */}
      {rest.length > 0 && (
        <div className="-mx-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {rest.map((p) => {
            const media = pickGridMedia(p, featured.included, { baseUrl });
            const pr = priceOf(p);
            const preorder = isPreorder(p, featured.included);
            return (
              <Link
                key={p.id}
                href={`/${p.attributes?.slug}`}
                className={cn(
                  "group block w-[46%] flex-shrink-0 snap-start overflow-hidden rounded-xl border border-border/30 bg-card no-underline shadow-sm transition-all duration-500 sm:w-auto",
                  "hover:-translate-y-0.5 hover:shadow-md"
                )}
              >
                <div className="relative">
                  <ProductMedia
                    media={media}
                    surface="grid"
                    decorative
                    className="aspect-square w-full overflow-hidden"
                    mediaClassName="h-full w-full object-cover transition-transform duration-500 ease-expo-out group-hover:scale-105"
                    placeholder={<CardMediaPlaceholder />}
                  />
                  {preorder && <PreorderBadge className="left-2 top-2" />}
                </div>
                <div className="space-y-1 p-3">
                  <p className="truncate font-title text-sm text-foreground">
                    {p.attributes?.name}
                  </p>
                  <p className="flex items-baseline gap-2">
                    <span className="font-title text-base text-foreground">
                      {pr.price}
                    </span>
                    {pr.msrp && (
                      <span className="font-body text-[11px] text-muted-foreground line-through">
                        {pr.msrp}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </motion.section>
  );
};

export default FeaturedShelf;

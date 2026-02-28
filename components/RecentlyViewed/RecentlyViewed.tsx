import React from "react";
import Link from "next/link";
import { useRecentlyViewed } from "@hooks/useRecentlyViewed";

interface RecentlyViewedProps {
  excludeSlug?: string;
  title?: string;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  excludeSlug,
  title = "Recently Viewed"
}) => {
  const { products } = useRecentlyViewed(excludeSlug);

  if (products.length === 0) return null;

  return (
    <section className="w-full pb-5">
      <h2 className="font-title text-xl text-foreground">{title}</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible lg:grid-cols-6">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/${product.slug}`}
            className="w-36 flex-shrink-0 no-underline md:w-auto"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              <img
                src={product.imgSrc}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <h4 className="mt-2 truncate font-title text-sm text-foreground">
              {product.name}
            </h4>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;

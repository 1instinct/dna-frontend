import React from "react";
import Link from "next/link";
import { useRecentlyViewed } from "@hooks/useRecentlyViewed";
import { useProducts } from "@hooks/useProducts";
import { visibleRecentProducts } from "@lib/productVisibility";

interface RecentlyViewedProps {
  excludeSlug?: string;
  title?: string;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  excludeSlug,
  title = "Recently Viewed"
}) => {
  const { products: recent } = useRecentlyViewed(excludeSlug);
  const { data: listing, isLoading } = useProducts(1);

  if (isLoading) return null;
  // Drop entries for products hidden since they were viewed.
  const products = visibleRecentProducts(recent, listing);
  if (products.length === 0) return null;

  return (
    <section className="w-full pb-5">
      <h2 className="font-title text-xl text-foreground">{title}</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible lg:grid-cols-6">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/${product.slug}`}
            className="block w-36 flex-shrink-0 rounded-lg no-underline ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-auto"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              {/* The name below is the link's text: empty alt so it is not read twice. */}
              <img
                src={product.imgSrc}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <h3 className="mt-2 truncate font-title text-sm text-foreground">
              {product.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;

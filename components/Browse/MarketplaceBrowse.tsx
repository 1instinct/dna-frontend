import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@lib/utils";
import { Layout } from "@components/Layout";
import { Button, EmptyState, Skeleton } from "@components/ui";
import { pickGridMedia } from "@lib/productMedia";
import { useMarketplaceProducts } from "@hooks/useMarketplace";
import { kindLabel } from "../../lib/digitalKinds";
import { filterMarketplace, kindsIn } from "../../lib/marketplace";
import { MarketplaceCard } from "./MarketplaceCard";
import { ModeToggle } from "./ModeToggle";

const SORTS = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "price_asc", label: "Price (Low to High)" },
  { value: "price_desc", label: "Price (High to Low)" },
  { value: "newest", label: "Newest First" }
];

/**
 * /browse?mode=marketplace: the creator marketplace's digital products, a
 * page at a time, narrowed by kind chips and a search, then sorted.
 */
export const MarketplaceBrowse: React.FC = () => {
  const marketplace = useMarketplaceProducts();
  const [kinds, setKinds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name_asc");

  const allKinds = useMemo(() => kindsIn(marketplace.data), [marketplace.data]);
  const products = useMemo(
    () => filterMarketplace(marketplace.data, { kinds, search, sort }),
    [marketplace.data, kinds, search, sort]
  );
  const empty =
    !marketplace.isLoading && !marketplace.hasNextPage && allKinds.length === 0;

  const toggleKind = (k: string) =>
    setKinds((ks) => (ks.includes(k) ? ks.filter((x) => x !== k) : [...ks, k]));

  return (
    <Layout>
      <div className="min-h-screen w-full bg-background px-5 py-10 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-title text-2xl font-bold text-foreground md:text-3xl">
              Marketplace
            </h1>
            <ModeToggle mode="marketplace" />
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border/30 bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Kinds"
            >
              {allKinds.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kinds.includes(k)}
                  onClick={() => toggleKind(k)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 font-title text-xs uppercase tracking-wider transition-colors",
                    kinds.includes(k)
                      ? "border-brand bg-brand text-white"
                      : "border-border text-muted-foreground hover:border-brand hover:text-foreground"
                  )}
                >
                  {kindLabel(k, true)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  aria-label="Search the marketplace"
                  placeholder="Search products or creators"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 sm:w-64"
                />
              </div>
              <select
                aria-label="Sort by"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer rounded-lg border border-border bg-background px-3 py-2 font-body text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {marketplace.isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="aspect-video" />
              ))}
            </div>
          ) : empty ? (
            <EmptyState
              className="rounded-xl bg-card"
              title="Nothing here yet"
              description="Creators' products show up here once they go live."
            />
          ) : products.length === 0 ? (
            <EmptyState
              className="rounded-xl bg-card"
              title="No products found"
              description="Try another kind or search."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <MarketplaceCard
                  key={p.id}
                  product={p}
                  media={pickGridMedia(p, marketplace.included, {
                    baseUrl: process.env.NEXT_PUBLIC_SPREE_API_URL || ""
                  })}
                />
              ))}
            </div>
          )}

          {marketplace.hasNextPage && (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={marketplace.isFetchingNextPage}
                onClick={() => marketplace.fetchNextPage()}
              >
                {marketplace.isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

import React, { useState, useMemo, useEffect } from "react";
import { GetStaticProps } from "next";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { useRouter } from "next/router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@lib/utils";
import { Layout } from "@components/Layout";
import { ProductList } from "@components/ProductList";
import { Loading } from "@components/Loading";
import { useProducts } from "@hooks/useProducts";
import { fetchProducts } from "@hooks/useProducts";
import { QueryKeys } from "@hooks/queryKeys";
import { ModeToggle, BrowseMode } from "./ModeToggle";
import { MarketplaceProduct } from "./MarketplaceCard";

// ──────────────────────────────────────────────
// Placeholder product data (fallback when Spree is not seeded)
// ──────────────────────────────────────────────

export interface ShopProduct {
  name: string;
  slug: string;
  price: string;
  category: string;
  preorder?: boolean;
  colors?: string[];
}

const SHOP_PRODUCTS: ShopProduct[] = [
  {
    name: "Beeper \u03948",
    slug: "beeper-8",
    price: "$199.99",
    category: "Devices",
    preorder: true,
    colors: ["#000", "#fff"]
  },
  {
    name: "Carrying Case",
    slug: "beeper-carrying-case",
    price: "$29.99",
    category: "Accessories"
  },
  {
    name: "USB-C Cable",
    slug: "usb-c-cable",
    price: "$14.99",
    category: "Accessories"
  },
  {
    name: "Beeper T-Shirt",
    slug: "beeper-t-shirt",
    price: "$34.99",
    category: "Apparel"
  }
];

const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  {
    name: "Beeper iOS App",
    slug: "beeper-ios-app",
    price: "$4.99",
    type: "Synths",
    compatibility: "iOS 16+"
  },
  {
    name: "Starter Sample Pack",
    slug: "starter-sample-pack",
    price: "$9.99",
    type: "Sample Packs",
    format: "WAV / MIDI",
    fileCount: "64 samples"
  },
  {
    name: "Analog Dreams Synth",
    slug: "analog-dreams-synth",
    price: "$6.99",
    type: "Synths",
    compatibility: "iOS 16+"
  },
  {
    name: "Neon Grid Visualizer",
    slug: "neon-grid-visualizer",
    price: "$3.99",
    type: "Visualizers",
    compatibility: "iOS 16+"
  }
];

const SHOP_CATEGORIES = ["Devices", "Accessories", "Apparel"];
const MARKETPLACE_CATEGORIES = ["Sample Packs", "Synths", "Visualizers"];

// ──────────────────────────────────────────────

interface FiltersState {
  categories: string[];
  priceMin: string;
  priceMax: string;
  search: string;
  sort: string;
}

export const Browse: React.FC = () => {
  const router = useRouter();

  // Mode from query param — defaults to "shop"
  const mode: BrowseMode =
    router.query.mode === "marketplace" ? "marketplace" : "shop";

  const [filters, setFilters] = useState<FiltersState>({
    categories:
      (router.query.categories as string)?.split(",").filter(Boolean) || [],
    priceMin: (router.query.priceMin as string) || "",
    priceMax: (router.query.priceMax as string) || "",
    search: (router.query.search as string) || "",
    sort: (router.query.sort as string) || "name_asc"
  });

  const [tempPriceMin, setTempPriceMin] = useState(filters.priceMin);
  const [tempPriceMax, setTempPriceMax] = useState(filters.priceMax);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeChips, setActiveChips] = useState<string[]>([]);

  // Spree API products (may be empty if not seeded)
  const { data: productsData, isLoading } = useProducts(1);

  // Reset filter chips when mode changes
  useEffect(() => {
    setActiveChips([]);
    setFilters((prev) => ({
      ...prev,
      categories: [],
      search: "",
      priceMin: "",
      priceMax: ""
    }));
    setTempPriceMin("");
    setTempPriceMax("");
  }, [mode]);

  // Update URL when filters change (preserve mode param)
  useEffect(() => {
    const query: any = { mode };
    if (filters.categories.length > 0)
      query.categories = filters.categories.join(",");
    if (filters.priceMin) query.priceMin = filters.priceMin;
    if (filters.priceMax) query.priceMax = filters.priceMax;
    if (filters.search) query.search = filters.search;
    if (filters.sort !== "name_asc") query.sort = filters.sort;

    router.push(
      {
        pathname: "/browse",
        query
      },
      undefined,
      { shallow: true }
    );
  }, [filters]);

  // Category chips for the active mode
  const chipCategories =
    mode === "shop" ? SHOP_CATEGORIES : MARKETPLACE_CATEGORIES;

  const handleChipToggle = (chip: string) => {
    setActiveChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  // ── Shop mode: merge Spree API data with placeholder fallback ──

  const availableCategories = useMemo(() => {
    if (!productsData?.data) return [];
    const categoriesSet = new Set<string>();
    productsData.data.forEach((product: any) => {
      if (
        product.attributes?.taxon_names &&
        Array.isArray(product.attributes.taxon_names)
      ) {
        product.attributes.taxon_names.forEach((cat: string) =>
          categoriesSet.add(cat)
        );
      }
    });
    return Array.from(categoriesSet).sort();
  }, [productsData]);

  // Shop: Spree-sourced products, filtered
  const filteredSpreeProducts = useMemo(() => {
    if (!productsData?.data) return [];
    let products = [...productsData.data];

    if (filters.categories.length > 0) {
      products = products.filter((product: any) => {
        if (!product.attributes?.taxon_names) return false;
        return filters.categories.some((cat: string) =>
          product.attributes.taxon_names.includes(cat)
        );
      });
    }

    const minPrice = parseFloat(filters.priceMin);
    const maxPrice = parseFloat(filters.priceMax);

    if (!isNaN(minPrice)) {
      products = products.filter(
        (product: any) =>
          parseFloat(product.attributes?.price || "0") >= minPrice
      );
    }

    if (!isNaN(maxPrice)) {
      products = products.filter(
        (product: any) =>
          parseFloat(product.attributes?.price || "0") <= maxPrice
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(
        (product: any) =>
          product.attributes?.name?.toLowerCase().includes(searchLower) ||
          product.attributes?.description
            ?.toLowerCase()
            .includes(searchLower) ||
          product.attributes?.slug?.toLowerCase().includes(searchLower)
      );
    }

    switch (filters.sort) {
      case "price_asc":
        products.sort(
          (a: any, b: any) =>
            parseFloat(a.attributes?.price || "0") -
            parseFloat(b.attributes?.price || "0")
        );
        break;
      case "price_desc":
        products.sort(
          (a: any, b: any) =>
            parseFloat(b.attributes?.price || "0") -
            parseFloat(a.attributes?.price || "0")
        );
        break;
      case "name_asc":
        products.sort((a: any, b: any) =>
          (a.attributes?.name || "").localeCompare(b.attributes?.name || "")
        );
        break;
      case "name_desc":
        products.sort((a: any, b: any) =>
          (b.attributes?.name || "").localeCompare(a.attributes?.name || "")
        );
        break;
      case "newest":
        products.sort(
          (a: any, b: any) =>
            new Date(b.attributes?.created_at || 0).getTime() -
            new Date(a.attributes?.created_at || 0).getTime()
        );
        break;
      default:
        break;
    }

    return products;
  }, [productsData, filters]);

  // Shop placeholder products, filtered by chip + search
  const filteredShopPlaceholders = useMemo(() => {
    let items = [...SHOP_PRODUCTS];
    if (activeChips.length > 0) {
      items = items.filter((p) => activeChips.includes(p.category));
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s)
      );
    }
    return items;
  }, [activeChips, filters.search]);

  // Marketplace placeholder products, filtered by chip + search
  const filteredMarketplacePlaceholders = useMemo(() => {
    let items = [...MARKETPLACE_PRODUCTS];
    if (activeChips.length > 0) {
      items = items.filter((p) => activeChips.includes(p.type));
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s)
      );
    }
    return items;
  }, [activeChips, filters.search]);

  // Determine if Spree data is available
  const hasSpreeData =
    mode === "shop" && productsData?.data && productsData.data.length > 0;

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleApplyPrice = () => {
    setFilters((prev) => ({
      ...prev,
      priceMin: tempPriceMin,
      priceMax: tempPriceMax
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      priceMin: "",
      priceMax: "",
      search: "",
      sort: "name_asc"
    });
    setTempPriceMin("");
    setTempPriceMax("");
    setActiveChips([]);
  };

  const hasActiveFilters = Boolean(
    filters.categories.length > 0 ||
      filters.priceMin ||
      filters.priceMax ||
      filters.search ||
      activeChips.length > 0
  );

  // ── Sidebar filters (Spree-powered, for Shop mode with Spree data) ──

  const FilterContent = () => (
    <>
      {/* Search */}
      <div className="mb-6 border-b border-glass-border pb-6">
        <h3 className="mb-3 font-title text-sm font-semibold text-white">
          Search
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-full rounded-lg border border-glass-border bg-surface-deep py-2.5 pl-10 pr-3 font-body text-sm text-white placeholder:text-white/50 transition-colors focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20"
          />
        </div>
      </div>

      {/* Categories */}
      {availableCategories.length > 0 && (
        <div className="mb-6 border-b border-glass-border pb-6">
          <h3 className="mb-3 font-title text-sm font-semibold text-white">
            Categories
          </h3>
          <div className="space-y-2.5">
            {availableCategories.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-white/50 transition-colors hover:text-white"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4 cursor-pointer rounded border-glass-border accent-neon-cyan"
                />
                {category}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="mb-3 font-title text-sm font-semibold text-white">
          Price Range
        </h3>
        <div className="mb-3 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={tempPriceMin}
            onChange={(e) => setTempPriceMin(e.target.value)}
            min="0"
            step="0.01"
            className="w-full flex-1 rounded-lg border border-glass-border bg-surface-deep px-3 py-2 font-body text-sm text-white placeholder:text-white/50 transition-colors focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-white/50">-</span>
          <input
            type="number"
            placeholder="Max"
            value={tempPriceMax}
            onChange={(e) => setTempPriceMax(e.target.value)}
            min="0"
            step="0.01"
            className="w-full flex-1 rounded-lg border border-glass-border bg-surface-deep px-3 py-2 font-body text-sm text-white placeholder:text-white/50 transition-colors focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <button
          onClick={handleApplyPrice}
          className="w-full rounded-lg bg-neon-cyan px-4 py-2 font-title text-sm font-semibold text-black transition-all hover:bg-neon-cyan/90 hover:-translate-y-px active:translate-y-0"
        >
          Apply
        </button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="mt-2 w-full rounded-lg border border-neon-cyan bg-transparent px-4 py-2.5 font-title text-sm font-semibold text-neon-cyan transition-all hover:bg-neon-cyan hover:text-black hover:-translate-y-px active:translate-y-0"
        >
          Clear All Filters
        </button>
      )}
    </>
  );

  // ── Determine total product count ──
  const productCount =
    mode === "shop"
      ? hasSpreeData
        ? filteredSpreeProducts.length
        : filteredShopPlaceholders.length
      : filteredMarketplacePlaceholders.length;

  return (
    <Layout>
      <div className="min-h-screen w-full bg-surface-deep px-5 py-10 sm:px-5 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <h1
              className={cn(
                "font-pressstart text-2xl sm:text-3xl",
                mode === "shop" ? "neon-text-cyan" : "neon-text-magenta"
              )}
            >
              {mode === "shop" ? "SHOP" : "MARKETPLACE"}
            </h1>

            <ModeToggle mode={mode} />
          </motion.div>

          {/* Filter chips + search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              {chipCategories.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipToggle(chip)}
                  className={cn(
                    "rounded-lg px-4 py-2 font-title text-xs uppercase tracking-wider transition-all duration-200",
                    activeChips.includes(chip)
                      ? mode === "shop"
                        ? "bg-neon-cyan/20 border border-neon-cyan text-neon-cyan"
                        : "bg-neon-magenta/20 border border-neon-magenta text-neon-magenta"
                      : "glass-panel text-white/50 hover:text-white/70 hover:bg-white/[0.08]"
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="neon-focus w-full rounded-lg border border-glass-border bg-surface-deep py-2.5 pl-10 pr-3 font-title text-sm text-white placeholder:text-white/30 transition-all"
              />
            </div>
          </motion.div>

          {/* Main content area */}
          <div
            className={cn(
              "grid gap-8",
              // Only show sidebar when in shop mode with Spree data
              hasSpreeData
                ? "grid-cols-1 md:grid-cols-[280px_1fr]"
                : "grid-cols-1"
            )}
          >
            {/* Filter Sidebar — only for shop mode w/ Spree data */}
            {hasSpreeData && (
              <>
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="flex items-center gap-2 rounded-lg border border-glass-border glass-panel px-4 py-3 font-title text-sm text-white md:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-auto rounded-full bg-neon-cyan px-2 py-0.5 text-xs text-black">
                      {filters.categories.length +
                        (filters.priceMin ? 1 : 0) +
                        (filters.priceMax ? 1 : 0) +
                        (filters.search ? 1 : 0)}
                    </span>
                  )}
                </button>

                {/* Desktop sidebar */}
                <aside className="sticky top-24 hidden h-fit rounded-xl border border-glass-border glass-panel p-6 shadow-sm md:block">
                  <FilterContent />
                </aside>

                {/* Mobile sidebar */}
                {showMobileFilters && (
                  <div className="rounded-xl border border-glass-border glass-panel p-6 shadow-sm md:hidden">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-title text-base font-semibold">
                        Filters
                      </h2>
                      <button onClick={() => setShowMobileFilters(false)}>
                        <X className="h-5 w-5 text-white/50" />
                      </button>
                    </div>
                    <FilterContent />
                  </div>
                )}
              </>
            )}

            {/* Products area */}
            <main className="min-h-[400px]">
              {/* Sort bar */}
              <div className="mb-6 flex flex-col items-start justify-between gap-3 glass-panel px-5 py-4 sm:flex-row sm:items-center">
                <span className="font-title text-sm font-semibold text-white">
                  {productCount} {productCount === 1 ? "product" : "products"}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="font-body text-sm text-white/50">
                    Sort by:
                  </span>
                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sort: e.target.value
                      }))
                    }
                    className="cursor-pointer rounded-lg border border-glass-border bg-surface-deep px-3 py-2 pr-8 font-body text-sm text-white transition-colors hover:border-neon-cyan/40 focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20"
                  >
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="price_asc">Price (Low to High)</option>
                    <option value="price_desc">Price (High to Low)</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>

              {/* Loading state */}
              {isLoading && mode === "shop" && (
                <div className="flex min-h-[300px] items-center justify-center">
                  <Loading />
                </div>
              )}

              {/* Product grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {mode === "shop" ? (
                    // ── Shop mode ──
                    hasSpreeData ? (
                      filteredSpreeProducts.length > 0 ? (
                        <ProductList
                          products={{
                            data: filteredSpreeProducts,
                            included: productsData?.included
                          }}
                          title=""
                          mode="shop"
                        />
                      ) : (
                        <EmptyState
                          hasActiveFilters={hasActiveFilters}
                          onClear={handleClearFilters}
                        />
                      )
                    ) : !isLoading ? (
                      filteredShopPlaceholders.length > 0 ? (
                        <ProductList
                          placeholderProducts={filteredShopPlaceholders}
                          title=""
                          mode="shop"
                        />
                      ) : (
                        <EmptyState
                          hasActiveFilters={hasActiveFilters}
                          onClear={handleClearFilters}
                        />
                      )
                    ) : null
                  ) : // ── Marketplace mode ──
                  filteredMarketplacePlaceholders.length > 0 ? (
                    <ProductList
                      marketplaceProducts={filteredMarketplacePlaceholders}
                      title=""
                      mode="marketplace"
                    />
                  ) : (
                    <EmptyState
                      hasActiveFilters={hasActiveFilters}
                      onClear={handleClearFilters}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// ── Empty state sub-component ──

const EmptyState: React.FC<{
  hasActiveFilters: boolean;
  onClear: () => void;
}> = ({ hasActiveFilters, onClear }) => (
  <div className="glass-panel flex flex-col items-center justify-center px-5 py-20 text-center">
    <h2 className="mb-3 font-title text-lg text-white">No products found</h2>
    <p className="mb-6 font-body text-sm text-white/50">
      Try adjusting your filters or search terms
    </p>
    {hasActiveFilters && (
      <button
        onClick={onClear}
        className="rounded-lg border border-neon-cyan bg-transparent px-6 py-2.5 font-title text-sm font-semibold text-neon-cyan transition-all hover:bg-neon-cyan hover:text-black"
      >
        Clear All Filters
      </button>
    )}
  </div>
);

export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(QueryKeys.PRODUCTS, () => fetchProducts(1));

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    },
    revalidate: 60
  };
};

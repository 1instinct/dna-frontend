import React, { useState, useMemo, useEffect } from "react";
import { GetStaticProps } from "next";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { useRouter } from "next/router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@lib/utils";
import { Layout } from "@components/Layout";
import { ProductList } from "@components/ProductList";
import { Loading } from "@components/Loading";
import { useProducts } from "@hooks/useProducts";
import { fetchProducts } from "@hooks/useProducts";
import { QueryKeys } from "@hooks/queryKeys";

interface FiltersState {
  categories: string[];
  priceMin: string;
  priceMax: string;
  search: string;
  sort: string;
}

export const Browse: React.FC = () => {
  const router = useRouter();

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

  const { data: productsData, isLoading } = useProducts(1);

  // Update URL when filters change
  useEffect(() => {
    const query: any = {};
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

  const filteredProducts = useMemo(() => {
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
        (product: any) => parseFloat(product.attributes?.price || "0") >= minPrice
      );
    }

    if (!isNaN(maxPrice)) {
      products = products.filter(
        (product: any) => parseFloat(product.attributes?.price || "0") <= maxPrice
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(
        (product: any) =>
          product.attributes?.name?.toLowerCase().includes(searchLower) ||
          product.attributes?.description?.toLowerCase().includes(searchLower) ||
          product.attributes?.slug?.toLowerCase().includes(searchLower)
      );
    }

    switch (filters.sort) {
      case "price_asc":
        products.sort(
          (a: any, b: any) =>
            parseFloat(a.attributes?.price || "0") - parseFloat(b.attributes?.price || "0")
        );
        break;
      case "price_desc":
        products.sort(
          (a: any, b: any) =>
            parseFloat(b.attributes?.price || "0") - parseFloat(a.attributes?.price || "0")
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
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceMin ||
    filters.priceMax ||
    filters.search;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loading />
        </div>
      </Layout>
    );
  }

  const FilterContent = () => (
    <>
      {/* Search */}
      <div className="mb-6 border-b border-border/30 pb-6">
        <h3 className="mb-3 font-title text-sm font-semibold text-foreground">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 font-body text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Categories */}
      {availableCategories.length > 0 && (
        <div className="mb-6 border-b border-border/30 pb-6">
          <h3 className="mb-3 font-title text-sm font-semibold text-foreground">Categories</h3>
          <div className="space-y-2.5">
            {availableCategories.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4 cursor-pointer rounded border-border accent-brand"
                />
                {category}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="mb-3 font-title text-sm font-semibold text-foreground">Price Range</h3>
        <div className="mb-3 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={tempPriceMin}
            onChange={(e) => setTempPriceMin(e.target.value)}
            min="0"
            step="0.01"
            className="w-full flex-1 rounded-lg border border-border bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-muted-foreground">-</span>
          <input
            type="number"
            placeholder="Max"
            value={tempPriceMax}
            onChange={(e) => setTempPriceMax(e.target.value)}
            min="0"
            step="0.01"
            className="w-full flex-1 rounded-lg border border-border bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <button
          onClick={handleApplyPrice}
          className="w-full rounded-lg bg-brand px-4 py-2 font-title text-sm font-semibold text-white transition-all hover:bg-brand/90 hover:-translate-y-px active:translate-y-0"
        >
          Apply
        </button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="mt-2 w-full rounded-lg border border-brand bg-transparent px-4 py-2.5 font-title text-sm font-semibold text-brand transition-all hover:bg-brand hover:text-white hover:-translate-y-px active:translate-y-0"
        >
          Clear All Filters
        </button>
      )}
    </>
  );

  return (
    <Layout>
      <div className="min-h-screen w-full bg-background px-5 py-10 sm:px-5 md:px-10">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 font-title text-sm text-foreground md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-xs text-white">
                {filters.categories.length + (filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0) + (filters.search ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Filter Sidebar - Desktop */}
          <aside className="sticky top-24 hidden h-fit rounded-xl border border-border/30 bg-card p-6 shadow-sm md:block">
            <FilterContent />
          </aside>

          {/* Filter Sidebar - Mobile */}
          {showMobileFilters && (
            <div className="rounded-xl border border-border/30 bg-card p-6 shadow-sm md:hidden">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-title text-base font-semibold">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <FilterContent />
            </div>
          )}

          {/* Products Area */}
          <main className="min-h-[400px]">
            {/* Sort Bar */}
            <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-border/30 bg-card px-5 py-4 shadow-sm sm:flex-row sm:items-center">
              <span className="font-title text-sm font-semibold text-foreground">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </span>
              <div className="flex items-center gap-2.5">
                <span className="font-body text-sm text-muted-foreground">Sort by:</span>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                  className="cursor-pointer rounded-lg border border-border bg-background px-3 py-2 pr-8 font-body text-sm text-foreground transition-colors hover:border-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <ProductList
                products={{
                  data: filteredProducts,
                  included: productsData?.included
                }}
                title=""
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl bg-card px-5 py-20 text-center">
                <h2 className="mb-3 font-title text-lg text-foreground">No products found</h2>
                <p className="mb-6 font-body text-sm text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="rounded-lg border border-brand bg-transparent px-6 py-2.5 font-title text-sm font-semibold text-brand transition-all hover:bg-brand hover:text-white"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

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

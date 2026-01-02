import React, { useState, useMemo, useEffect } from "react";
import { GetStaticProps } from "next";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import { useRouter } from "next/router";
import { Layout } from "@components/Layout";
import { ProductList } from "@components/ProductList";
import { Loading } from "@components/Loading";
import { useProducts } from "@hooks/useProducts";
import { fetchProducts } from "@hooks/useProducts";
import { QueryKeys } from "@hooks/queryKeys";
import {
  PageContainer,
  ContentWrapper,
  FilterSidebar,
  ProductsArea,
  FilterSection,
  FilterTitle,
  FilterOption,
  FilterCheckbox,
  FilterLabel,
  SortContainer,
  SortLabel,
  SortSelect,
  SearchBar,
  SearchInput,
  ClearFiltersButton,
  ResultsCount,
  LoadingWrapper,
  EmptyState,
  PriceInputs,
  PriceInput,
  ApplyPriceButton
} from "./Browse.styles";

interface FiltersState {
  categories: string[];
  priceMin: string;
  priceMax: string;
  search: string;
  sort: string;
}

export const Browse: React.FC = () => {
  const router = useRouter();

  // Initialize filters from URL query params
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

  // Extract unique categories from products
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!productsData?.data) return [];

    let products = [...productsData.data];

    // Category filter
    if (filters.categories.length > 0) {
      products = products.filter((product: any) => {
        if (!product.attributes?.taxon_names) return false;
        return filters.categories.some((cat: string) =>
          product.attributes.taxon_names.includes(cat)
        );
      });
    }

    // Price filter
    const minPrice = parseFloat(filters.priceMin);
    const maxPrice = parseFloat(filters.priceMax);

    if (!isNaN(minPrice)) {
      products = products.filter((product: any) => {
        const price = parseFloat(product.attributes?.price || "0");
        return price >= minPrice;
      });
    }

    if (!isNaN(maxPrice)) {
      products = products.filter((product: any) => {
        const price = parseFloat(product.attributes?.price || "0");
        return price <= maxPrice;
      });
    }

    // Search filter
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

    // Sort
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
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <ContentWrapper>
          <FilterSidebar>
            <FilterSection>
              <FilterTitle>Search</FilterTitle>
              <SearchBar>
                <SearchInput
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </SearchBar>
            </FilterSection>

            {availableCategories.length > 0 && (
              <FilterSection>
                <FilterTitle>Categories</FilterTitle>
                {availableCategories.map((category) => (
                  <FilterOption key={category}>
                    <FilterCheckbox
                      type="checkbox"
                      id={`cat-${category}`}
                      checked={filters.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                    />
                    <FilterLabel htmlFor={`cat-${category}`}>
                      {category}
                    </FilterLabel>
                  </FilterOption>
                ))}
              </FilterSection>
            )}

            <FilterSection>
              <FilterTitle>Price Range</FilterTitle>
              <PriceInputs>
                <PriceInput
                  type="number"
                  placeholder="Min"
                  value={tempPriceMin}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTempPriceMin(e.target.value)
                  }
                  min="0"
                  step="0.01"
                />
                <span>-</span>
                <PriceInput
                  type="number"
                  placeholder="Max"
                  value={tempPriceMax}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTempPriceMax(e.target.value)
                  }
                  min="0"
                  step="0.01"
                />
              </PriceInputs>
              <ApplyPriceButton onClick={handleApplyPrice}>
                Apply
              </ApplyPriceButton>
            </FilterSection>

            {hasActiveFilters && (
              <ClearFiltersButton onClick={handleClearFilters}>
                Clear All Filters
              </ClearFiltersButton>
            )}
          </FilterSidebar>

          <ProductsArea>
            <SortContainer>
              <ResultsCount>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </ResultsCount>
              <div>
                <SortLabel>Sort by:</SortLabel>
                <SortSelect
                  value={filters.sort}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFilters((prev) => ({ ...prev, sort: e.target.value }))
                  }
                >
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="newest">Newest First</option>
                </SortSelect>
              </div>
            </SortContainer>

            {filteredProducts.length > 0 ? (
              <ProductList
                products={{
                  data: filteredProducts,
                  included: productsData?.included
                }}
                title="Browse Products"
              />
            ) : (
              <EmptyState>
                <h2>No products found</h2>
                <p>Try adjusting your filters or search terms</p>
                {hasActiveFilters && (
                  <ClearFiltersButton onClick={handleClearFilters}>
                    Clear All Filters
                  </ClearFiltersButton>
                )}
              </EmptyState>
            )}
          </ProductsArea>
        </ContentWrapper>
      </PageContainer>
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

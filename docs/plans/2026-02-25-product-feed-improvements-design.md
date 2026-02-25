# Product Feed Improvements Design

## Goal

Improve product discovery on mobile product pages with three changes:
1. Show similar/recommended products on mobile (currently hidden)
2. Taxon-based similar product filtering (currently shows generic page 1 products)
3. Recently viewed products tracking via localStorage

## Changes

### 1. `useRecentlyViewed` hook

New hook at `hooks/useRecentlyViewed/useRecentlyViewed.ts`.

Stores up to 12 recently viewed products in localStorage key `dna_recently_viewed`.

```ts
type RecentProduct = { slug: string; name: string; imgSrc: string; viewedAt: number }

useRecentlyViewed() -> { products: RecentProduct[], addProduct(p), clearHistory() }
```

- Called from RetailProductDetails and WholesaleProductDetails on `isSuccess`
- Excludes current product from displayed list
- Newest first, deduped by slug

### 2. Similar Products - taxon-based filtering

Replace `useProducts(1)` with `useProductFeed("similar", { filter: { taxons } })`.

- Extract taxon name from `thisProduct.included` where type === "taxon"
- Exclude current product client-side
- Fallback to generic latest if no taxon found

### 3. Mobile layout - horizontal scroll

- Remove `!isMobile &&` guards from both product detail pages
- On mobile: render product sections as horizontally scrollable rows (overflow-x-auto, snap scrolling)
- On desktop: keep existing grid layout
- Apply to Similar Products, Recommended For You, and Recently Viewed sections

### 4. RecentlyViewed component

New component at `components/RecentlyViewed/RecentlyViewed.tsx`.

Renders recently viewed products as compact cards in a horizontal scroll row. Uses data from `useRecentlyViewed` hook, not from API (instant, no loading state).

## Files

| File | Change |
|---|---|
| `hooks/useRecentlyViewed/useRecentlyViewed.ts` | New - localStorage hook |
| `hooks/useRecentlyViewed/index.ts` | New - barrel export |
| `hooks/index.ts` | Add useRecentlyViewed export |
| `components/RecentlyViewed/RecentlyViewed.tsx` | New - horizontal scroll component |
| `components/RecentlyViewed/index.ts` | New - barrel export |
| `components/ProductDetails/RetailProductDetails.tsx` | Taxon-based similar, remove !isMobile, add recently viewed, track views |
| `components/ProductDetails/WholesaleProductDetails.tsx` | Same changes |
| `components/ProductList/ProductList.tsx` | Add horizontal scroll variant for mobile |

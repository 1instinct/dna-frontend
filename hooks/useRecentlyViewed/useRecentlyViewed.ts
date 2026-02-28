import { useState, useEffect, useCallback } from "react";

export interface RecentProduct {
  slug: string;
  name: string;
  imgSrc: string;
  viewedAt: number;
}

const STORAGE_KEY = "dna_recently_viewed";
const MAX_ITEMS = 12;

function loadProducts(): RecentProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProducts(products: RecentProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // localStorage full or unavailable
  }
}

export const useRecentlyViewed = (excludeSlug?: string) => {
  const [products, setProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    setProducts(loadProducts());
  }, []);

  const addProduct = useCallback((product: Omit<RecentProduct, "viewedAt">) => {
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.slug !== product.slug);
      const updated = [{ ...product, viewedAt: Date.now() }, ...filtered].slice(
        0,
        MAX_ITEMS
      );
      saveProducts(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts([]);
  }, []);

  const displayed = excludeSlug
    ? products.filter((p) => p.slug !== excludeSlug)
    : products;

  return { products: displayed, addProduct, clearHistory };
};

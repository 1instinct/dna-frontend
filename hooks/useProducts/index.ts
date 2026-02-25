import { useQuery } from "react-query";
import { IProducts } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { spreeClient } from "../../config/spree";
import { QueryKeys } from "../queryKeys";
import { useEffect, useState } from "react";

const fetchProducts = async (
  page: number = 1,
  search?: string,
  taxons?: string,
  sort: string = "created_at"
) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  const params: any = {
    sort,
    include: "images,variants,option_types,variants.option_values",
    filter: {}
  };

  if (search && search.length > 1) {
    params.filter.name = search;
  }

  if (taxons) {
    params.filter.taxons = taxons;
  }

  const response = await spreeClient.products.list(
    {
      bearerToken: token ? token.access_token : undefined
    },
    params
  );

  if (response.isSuccess()) {
    return response.success();
  } else {
    throw new Error("Products request failed");
  }
};

const useProducts = (
  page: number,
  search?: string,
  taxons?: string,
  sort: string = "created_at"
) => {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  return useQuery<IProducts, false>(
    [QueryKeys.PRODUCTS, page, debouncedSearch, taxons, sort],
    () => fetchProducts(page, debouncedSearch, taxons, sort),
    {
      enabled: true // Always enable the query
    }
  );
};

export { useProducts, fetchProducts };

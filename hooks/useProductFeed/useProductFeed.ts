import { useQuery } from "react-query";
import { spreeClient } from "@config/spree";
import { QueryKeys } from "@hooks/queryKeys";
import constants from "@utilities/constants";

export interface ProductFeedParams {
  page?: number;
  per_page?: number;
  sort?: string;
  filter?: {
    ids?: string;
    skus?: string;
    price?: string;
    taxons?: string;
    name?: string;
    show_deleted?: boolean;
    show_discontinued?: boolean;
  };
  include?: string;
}

export type FeedType =
  | "latest"
  | "deals"
  | "trending"
  | "buy_again"
  | "recommended"
  | "similar"
  | "saved_for_later"
  | "bestsellers"
  | "custom";

// Predefined feed configurations
export const FEED_CONFIGS: Record<FeedType, Partial<ProductFeedParams>> = {
  latest: {
    sort: "-created_at",
    per_page: 12
  },
  deals: {
    sort: "price",
    per_page: 12
  },
  trending: {
    sort: "-updated_at",
    per_page: 12
  },
  bestsellers: {
    sort: "-updated_at",
    per_page: 12
  },
  buy_again: {
    sort: "-updated_at",
    per_page: 12
  },
  recommended: {
    sort: "-updated_at",
    per_page: 12
  },
  similar: {
    sort: "-updated_at",
    per_page: 12
  },
  saved_for_later: {
    sort: "-updated_at",
    per_page: 12
  },
  custom: {
    per_page: 12
  }
};

export const fetchProductFeed = async (params: ProductFeedParams) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();

  // Build query parameters using SDK's IQuery format
  const queryParams: any = {};

  // Add pagination
  if (params.page) queryParams.page = params.page;
  if (params.per_page) queryParams.per_page = params.per_page;

  // Add sort parameter
  if (params.sort) queryParams.sort = params.sort;

  // Build filter object (SDK will add the filter[] prefix)
  if (params.filter) {
    queryParams.filter = {};

    if (params.filter.ids) queryParams.filter.ids = params.filter.ids;
    if (params.filter.skus) queryParams.filter.skus = params.filter.skus;
    if (params.filter.price) queryParams.filter.price = params.filter.price;
    if (params.filter.taxons && params.filter.taxons.trim()) {
      console.log("Adding taxons filter:", params.filter.taxons);
      // Wrap taxon value in quotes as required by Spree API
      queryParams.filter.taxons = `"${params.filter.taxons}"`;
    }
    if (params.filter.name) queryParams.filter.name = params.filter.name;
    if (params.filter.show_deleted !== undefined)
      queryParams.filter.show_deleted = params.filter.show_deleted;
    if (params.filter.show_discontinued !== undefined)
      queryParams.filter.show_discontinued = params.filter.show_discontinued;
  }

  // Add include parameter if specified
  // if (params.include) {
  //   queryParams.include = params.include;
  // }
  queryParams.include = "images,variants,option_types,variants.option_values";

  constants.IS_DEBUG &&
    console.log("Fetching product feed with params:", queryParams);

  const tokenParam = token?.access_token
    ? { bearerToken: token.access_token }
    : { bearerToken: undefined };

  const response = await spreeClient.products.list(tokenParam, queryParams);

  console.log("Product feed response:", response);
  console.log("Is success:", response.isSuccess());

  if (response.isSuccess()) {
    const data = response.success();
    console.log("Product feed success data:", data);
    console.log("Products count:", data?.data?.length);
    return data;
  } else {
    const error = response.fail();
    console.error("Product feed error:", error);
    throw new Error(error.message || "Failed to fetch products");
  }
};

export const useProductFeed = (
  feedType: FeedType,
  customParams?: Partial<ProductFeedParams>,
  enabled: boolean = true
) => {
  // Merge feed config with custom params
  const feedConfig = FEED_CONFIGS[feedType] || {};
  const mergedParams: ProductFeedParams = {
    ...feedConfig,
    ...customParams,
    filter: {
      ...feedConfig.filter,
      ...customParams?.filter
    }
  };

  const queryKey = [QueryKeys.PRODUCT_FEED, feedType, mergedParams];

  return useQuery(queryKey, () => fetchProductFeed(mergedParams), {
    enabled,
    staleTime: 60000, // 1 minute
    onError: (error: any) => {
      console.error(`Failed to fetch ${feedType} feed:`, error.message);
    },
    onSuccess: (data) => {
      constants.IS_DEBUG && console.log(`${feedType} feed fetched:`, data);
    }
  });
};

import { useQuery } from "react-query";
import { QueryKeys } from "@hooks/queryKeys";
import constants from "@utilities/constants";

const API_BASE =
  process.env.NEXT_PUBLIC_SPREE_API_URL || "http://localhost:3001";

export interface StoreAttributes {
  name: string;
  url: string;
  meta_description?: string;
  meta_keywords?: string;
  seo_title?: string;
  default_currency: string;
  default: boolean;
  supported_currencies: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  default_locale: string;
  customer_support_email?: string;
  description?: string;
  address?: string;
  contact_phone?: string;
  supported_locales: string;
  favicon_path?: string;
}

export interface StoreData {
  id: string;
  type: "store";
  attributes: StoreAttributes;
  relationships: {
    default_country: {
      data: {
        id: string;
        type: "country";
      };
    };
  };
}

export interface StoreResponse {
  data: StoreData;
}

export const fetchStore = async (): Promise<StoreData> => {
  const apiToken = process.env.NEXT_PUBLIC_SPREE_ACCESS_TOKEN;

  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json;charset=UTF-8");
  requestHeaders.set("X-Spree-Token", `${apiToken}`);

  const response = await fetch(`${API_BASE}/api/v2/storefront/store`, {
    method: "GET",
    headers: requestHeaders
  });

  if (!response.ok) {
    throw new Error("Failed to fetch store information");
  }

  const data: StoreResponse = await response.json();

  return data.data;
};

export const useStore = () => {
  return useQuery<StoreData, Error>([QueryKeys.STORE], fetchStore, {
    staleTime: 300000, // 5 minutes - store data doesn't change often
    onError: (error) => {
      console.error("Failed to fetch store:", error.message);
    },
    onSuccess: (data) => {
      constants.IS_DEBUG && console.log("Store fetched successfully:", data);
    }
  });
};

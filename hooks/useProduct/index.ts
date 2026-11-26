import { useQuery } from "react-query";
import { IProduct } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { QueryKeys } from "../queryKeys";

export const PRODUCT_INCLUDES =
  "default_variant,variants,option_types,product_properties,taxons,images,variants.option_values";

export interface FetchProductOptions {
  /** Explicit token (SSR); in the browser the stored user token is used. */
  bearerToken?: string;
  signal?: AbortSignal;
}

/** Normalizes a route or `asPath` value into the product query id. */
export const productQueryId = (slugOrPath: string): string =>
  slugOrPath.split(/[?#]/)[0].toLowerCase().replace("/", "");

const fetchProduct = async (
  slug: string,
  options: FetchProductOptions = {}
): Promise<IProduct> => {
  let accessToken = options.bearerToken;
  // localStorage only exists in the browser; SSR fetches anonymously.
  if (!accessToken && typeof window !== "undefined") {
    const storage = (await import("../../config/storage")).default;
    const token = await storage.getToken();
    accessToken = token?.access_token;
  }
  const spreeUrl = process.env.NEXT_PUBLIC_SPREE_API_URL || undefined;
  const productUrl = `${spreeUrl}/api/v2/storefront/products/${slug}?include=${PRODUCT_INCLUDES}`;

  const response = await fetch(productUrl.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken ? `Bearer ${accessToken}` : ""
    },
    signal: options.signal
  })
    .then((res) => {
      if (res.status >= 200 && res.status <= 299) {
        return res.json();
      } else {
        throw new Error(`Failed to fetch product: ${res.statusText}`);
      }
    })
    .catch((err) => {
      throw new Error(`Product request failed: ${err.message}`);
    });

  return response;
};

const useProduct = (id: string) => {
  return useQuery<IProduct, false>([QueryKeys.PRODUCT, id], () =>
    fetchProduct(id)
  );
};

export { useProduct, fetchProduct };

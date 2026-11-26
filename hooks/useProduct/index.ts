import { useQuery } from "react-query";
import { IProduct } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { spreeClient } from "../../config/spree";
import { QueryKeys } from "../queryKeys";
import {
  describeRequestError,
  requestWithVideosFallback
} from "../../lib/spreeInclude";
import {
  ProductNotFoundError,
  assertProductVisible,
  isProductNotFoundError,
  shouldRetryProductFetch
} from "../../lib/productVisibility";

// `videos` is appended (and dropped again if the backend lacks it).
const PRODUCT_INCLUDE =
  "default_variant,variants,option_types,product_properties,taxons,images,variants.option_values";

const fetchProduct = async (slug: string): Promise<IProduct> => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  const spreeUrl = process.env.NEXT_PUBLIC_SPREE_API_URL || undefined;
  const productUrl = (include: string) =>
    `${spreeUrl}/api/v2/storefront/products/${slug}?include=${include}`;

  return requestWithVideosFallback<IProduct>(
    PRODUCT_INCLUDE,
    async (include) => {
      const res = await fetch(productUrl(include), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token.access_token}` : ""
        }
      });
      if (res.status >= 200 && res.status <= 299) return res.json();
      const body = await res.text().catch(() => "");
      throw Object.assign(
        new Error(`Failed to fetch product: ${res.statusText} ${body}`),
        { status: res.status }
      );
    },
    describeRequestError
  )
    .then((doc) => assertProductVisible(doc, slug))
    .catch((err) => {
      if (isProductNotFoundError(err)) throw new ProductNotFoundError(slug);
      throw new Error(`Product request failed: ${err?.message}`);
    });
};

const useProduct = (id: string) => {
  return useQuery<IProduct, false>(
    [QueryKeys.PRODUCT, id],
    () => fetchProduct(id),
    { enabled: !!id, retry: shouldRetryProductFetch }
  );
};

export { useProduct, fetchProduct };

import { useQuery } from "react-query";
import { IProduct } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { spreeClient } from "../../config/spree";
import { QueryKeys } from "../queryKeys";

const fetchProduct = async (slug: string): Promise<IProduct> => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  // Use relative URL on client (proxied via Next.js rewrite), full URL on server
  const spreeUrl =
    typeof window !== "undefined"
      ? ""
      : process.env.NEXT_PUBLIC_SPREE_API_URL || "http://localhost:8080";
  const productUrl = `${spreeUrl}/api/v2/storefront/products/${slug}?include=default_variant,variants,option_types,product_properties,taxons,images,variants.option_values,variants.images&image_transformation[size]=1200x&image_transformation[quality]=85`;

  const response = await fetch(productUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token.access_token}` : ""
    }
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
  return useQuery<IProduct, false>(
    [QueryKeys.PRODUCT, id],
    () => fetchProduct(id),
    { enabled: !!id }
  );
};

export { useProduct, fetchProduct };

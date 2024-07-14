import { useQuery } from "react-query";
import { IProduct } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { spreeClient } from "../../config/spree";
import { QueryKeys } from "../queryKeys";

const fetchProduct = async (slug: string): Promise<IProduct> => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  const spreeUrl = process.env.NEXT_PUBLIC_SPREE_API_URL || undefined;
  const productUrl = `${spreeUrl}/api/v2/storefront/products/${slug}?include=default_variant,variants,option_types,product_properties,taxons,images,variants.option_values`;
  const response = await fetch(productUrl.toString(), {
    method: "GET"
  })
    .then((res) => {
      // console.log("FOUND PRODUCT: ", res.status);
      if (res.status >= 200 && res.status <= 299) {
        return res.json();
      }
    })
    .catch((err) => {
      // console.log("Uh oh ERR: ", err);
      throw new Error(`Product request failed: ${err.statusText}`);
    });

  // console.log("RESPONSE: ", response);
  return response;
};

const useProduct = (id: string) => {
  return useQuery<IProduct, false>([QueryKeys.PRODUCT, id], () =>
    fetchProduct(id)
  );
};

export { useProduct, fetchProduct };

import { useQuery } from "react-query";
import { IProducts } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { spreeClient } from "../../config/spree";
import { QueryKeys } from "../queryKeys";

const fetchProducts = async (page: number = 1) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  const response = await spreeClient.products.list(
    {
      bearerToken: token ? token.access_token : undefined
    },
    {
      sort: "created_at",
      // include: 'primary_variant,variants,images,option_types,variants.option_values'
      include: "images,variants,option_types,variants.option_values"
    }
  );
  if (response.isSuccess()) {
    return response.success();
  } else {
    throw new Error("Products request failed");
  }
};
const useProducts = (page: number) => {
  return useQuery<IProducts, false>([QueryKeys.PRODUCTS, page], () =>
    fetchProducts(page)
  );
};

export { useProducts, fetchProducts };

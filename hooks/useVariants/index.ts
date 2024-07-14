import { useQuery } from "react-query";
// import { IVariant } from "@spree/storefront-api-v2-sdk/types/interfaces/";
import { spreeClient } from "../../config/spree";
import { QueryKeys } from "../queryKeys";

const fetchVariants = async (
  page: number = 1,
  productId: string
): Promise<any> => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  const spreeUrl = `${
    process.env.NEXT_PUBLIC_SPREE_API_URL
  }/api/v2/variants?filter[product_id_eq]=${productId}&token=${
    token ? token.access_token : process.env.NEXT_PUBLIC_SPREE_ACCESS_TOKEN
  }`;
  // const spreeUrl = `http://pol-admin-staging.instinct.is/api/v2/variants?filter[product_id_eq]=${productId}`;
  const strictUrl = encodeURI(spreeUrl);
  const myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/json");
  // myHeaders.append(
  //   "Authorization",
  //   `Bearer ${token ? token.access_token : process.env.NEXT_PUBLIC_SPREE_ACCESS_TOKEN}`
  //   // `Bearer ${token ? token.access_token : ""}`
  // );
  const response = await fetch(strictUrl, {
    method: "GET",
    headers: myHeaders
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log(err);
      throw new Error("Variant request failed");
    });

  return response.json();
  // const response = await spreeClient.products.show(
  //   {
  //     bearerToken: token ? token.access_token : undefined
  //   },
  //   id
  // );
  // if (response.isSuccess()) {
  //   return response.success();
  // } else {
  //   throw new Error("Variant request failed");
  // }
};

const useVariants = (page: number, productId: string) => {
  return useQuery<any, false>([QueryKeys.PRODUCT, page, productId], () =>
    fetchVariants(page, productId)
  );
};

export { useVariants, fetchVariants };

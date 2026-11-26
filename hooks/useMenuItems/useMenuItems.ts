import { useQuery } from "react-query";
import { QueryKeys } from "../queryKeys";

const fetchMenuItems = async (id: number = 1) => {
  // The storefront key is added server-side by pages/api/public/[...path].ts.
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json;charset=UTF-8");
  const response = await fetch(
    `/api/public/menu_items?menu_location_id=${id}`,
    {
      method: "GET",
      headers: requestHeaders
    }
  )
    .then((response) => {
      if (!response.ok) throw new Error("Menu Items request failed");
      else return response.json();
    })
    .then((data) => data)
    .catch((err) => {
      console.error(err);
      throw new Error("Menu Items request failed");
    });
  return response;
};
const useMenuItems = (id: number) => {
  return useQuery<any>([QueryKeys.MENU_ITEMS, id], () => fetchMenuItems(id), {
    retry: false
  });
};

export { useMenuItems, fetchMenuItems };

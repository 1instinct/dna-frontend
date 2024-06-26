import { useQuery } from "react-query";
import { QueryKeys } from "../queryKeys";

const fetchMenuItems = async (id: number = 1) => {
  const apiUrl = process.env.NEXT_PUBLIC_SPREE_API_URL;
  const token = process.env.NEXT_PUBLIC_SPREE_ACCESS_TOKEN;
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json;charset=UTF-8");
  requestHeaders.set("X-Spree-Token", `${token}`);
  const response = await fetch(
    `${apiUrl}/api/v1/menu_items?menu_location_id=${id}`,
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
  return useQuery<any>([QueryKeys.MENU_ITEMS, id], () => fetchMenuItems(id));
};

export { useMenuItems, fetchMenuItems };

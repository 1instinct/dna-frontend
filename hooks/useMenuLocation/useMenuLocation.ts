import { useQuery } from "react-query";
import { IStream } from "../../typings/stream";
import { QueryKeys } from "../queryKeys";

const fetchMenuLocation = async (id: number = 1) => {
  // The storefront key is added server-side by pages/api/public/[...path].ts.
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json;charset=UTF-8");
  const response = await fetch(`/api/public/menu_locations/${id}`, {
    method: "GET",
    headers: requestHeaders
  })
    .then((response) => {
      if (!response.ok) throw new Error("Menu Location request failed");
      else return response.json();
    })
    // .then((data) => console.log(data))
    .catch((err) => {
      console.log(err);
      throw new Error("Menu Location request failed");
    });
  // console.log(response)
  return response;
};
const useMenuLocation = (id: number) => {
  return useQuery<any>(
    [QueryKeys.MENU_LOCATION, id],
    () => fetchMenuLocation(id),
    { retry: false }
  );
};

export { useMenuLocation, fetchMenuLocation };

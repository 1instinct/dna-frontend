import { useQuery } from "react-query";
import { IStream } from "../../typings/stream";
import { QueryKeys } from "../queryKeys";

const fetchStream = async (id: string, page: number = 1) => {
  const storage = (await import("../../config/storage")).default;
  const apiUrl = process.env.NEXT_PUBLIC_SPREE_API_URL;
  const token = process.env.NEXT_PUBLIC_SPREE_ACCESS_TOKEN;
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json;charset=UTF-8");
  requestHeaders.set("X-Spree-Token", `${token}`);
  const response = await fetch(`${apiUrl}/api/v1/live_stream/${id}`, {
    method: "GET",
    headers: requestHeaders
  })
    .then((response) => {
      if (!response.ok) throw new Error("Streams request failed");
      else return response.json();
    })
    .then((data) => console.log(data))
    .catch((err) => {
      console.log(err);
      throw new Error("Streams request failed");
    });
  console.log(response);
  return response;
};
const useStream = (id: string, page: number) => {
  return useQuery<any>([QueryKeys.STREAMS, page], () => fetchStream(id, page));
};

export { useStream, fetchStream };

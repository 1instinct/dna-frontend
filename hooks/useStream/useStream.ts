import { useQuery } from "react-query";
import { IStream } from "../../typings/stream";
import { QueryKeys } from "../queryKeys";

const fetchStream = async (id: string) => {
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
      if (!response.ok) throw new Error("Stream request failed");
      else return response.json();
    })
    .catch((err) => {
      console.log(err);
      throw new Error("Stream request failed");
    });
  return response;
};

const useStream = (id: string) => {
  return useQuery<any>([QueryKeys.STREAM, id], () => fetchStream(id), {
    enabled: !!id
  });
};

export { useStream, fetchStream };

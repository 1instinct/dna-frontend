import { useQuery } from "react-query";
import { IStream } from "../../typings/stream";
import { QueryKeys } from "../queryKeys";

const fetchStream = async (id: string) => {
  // The storefront key is added server-side by pages/api/public/[...path].ts.
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json;charset=UTF-8");
  const response = await fetch(
    `/api/public/live_stream/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: requestHeaders
    }
  )
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

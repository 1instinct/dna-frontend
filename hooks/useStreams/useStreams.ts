import { useQuery } from "react-query";
import { IStream } from "../../typings/stream";
import { QueryKeys } from "../queryKeys";
import constants from "../../utilities/constants";

const fetchStreams = async (page: number = 1) => {
  // The storefront key is added server-side by pages/api/public/[...path].ts.
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  const response = await fetch("/api/public/live_stream", {
    method: "GET",
    headers: requestHeaders
  })
    .then((response) => {
      // constants.IS_DEBUG && console.log("RESPONSE: ", response);
      if (!response.ok) throw new Error("Streams request failed");
      else return response.json();
    })
    // .then((data) => console.log(data))
    .catch((err) => {
      constants.IS_DEBUG && console.log(err);
      throw new Error("Streams request failed");
    });
  // console.log(response)
  return response;
};
const useStreams = (page: number) => {
  return useQuery<any>([QueryKeys.STREAMS, page], () => fetchStreams(page));
};

export { useStreams, fetchStreams };

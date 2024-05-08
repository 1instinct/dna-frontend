import { useQuery } from "react-query";
import { IStream } from "../../typings/stream";
import { QueryKeys } from "../queryKeys";
import constants from "../../utilities/constants";

const fetchStreams = async (page: number = 1) => {
  const storage = (await import("../../config/storage")).default;
  const apiUrl = process.env.NEXT_PUBLIC_SPREE_API_URL;
  const apiKey = process.env.NEXT_PUBLIC_SPREE_API_KEY;
  const token = process.env.NEXT_PUBLIC_SPREE_ACCESS_TOKEN;
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("X-Spree-Token", `${token}`);
  const response = await fetch(`${apiUrl}/api/v1/live_stream`, {
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

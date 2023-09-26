import { useQuery, QueryFunction } from "react-query";
import { IVideo } from "../../typings/video";
import { QueryKeys } from "../queryKeys";

const fetchVideos: QueryFunction<
  any,
  [QueryKeys.VIDEOS, string, number]
> = async ({ queryKey }) => {
  console.log("fetchVideos: ", queryKey);
  const storage = (await import("../../config/storage")).default;
  const show = queryKey[1];
  console.log("show: ", show);
  const apiUrl = process.env.NEXT_PUBLIC_TV_API_URL;
  console.log(`Fetching from API URL: ${apiUrl}/${show}`);
  const requestHeaders: HeadersInit = new Headers();
  // requestHeaders.set("Content-Type", "application/json;charset=UTF-8");
  const response = await fetch(`${apiUrl}/${show}`, {
    method: "GET",
    headers: requestHeaders
  })
    .then((response) => {
      if (!response.ok) throw new Error("Videos request failed");
      else return response.json();
    })
    // .then((data) => console.log(data))
    .catch((err) => {
      console.log(err);
      throw new Error("Videos request failed");
    });
  // console.log(response)
  return response;
};

const fetchShows = async () => {
  const storage = (await import("../../config/storage")).default;
  const apiUrl = process.env.NEXT_PUBLIC_TV_API_URL;
  const requestHeaders: HeadersInit = new Headers();
  // requestHeaders.set("Content-Type", "application/json;charset=UTF-8");
  const response = await fetch(`${apiUrl}/shows`, {
    method: "GET",
    headers: requestHeaders
  })
    .then((response) => {
      console.log(response);
      if (!response.ok) throw new Error("Shows request failed");
      else return response.json();
    })
    // .then((data) => console.log(data))
    .catch((err) => {
      console.log(err);
      throw new Error("Shows request failed");
    });
  // console.log(response)
  return response;
};

const useVideos = (show: string, page: number) => {
  return useQuery<any>([QueryKeys.VIDEOS, page], () => fetchVideos(show, page));
};

const useShows = () => {
  return useQuery<any>([QueryKeys.SHOWS], () => fetchShows());
};

export { useVideos, fetchVideos, fetchShows };

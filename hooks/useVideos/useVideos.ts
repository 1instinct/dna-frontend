import { useQuery, QueryFunction } from "react-query";
import { IVideo, IShow } from "../../typings";
import { QueryKeys } from "../queryKeys";

const fetchVideos = async (show: string) => {
  // const [queryKey, show, page] = query.queryKey;
  // console.log("fetchVideos: ", show, page);
  const apiUrl = process.env.NEXT_PUBLIC_TV_API_URL;

  if (!show) throw new Error("No show provided");

  const url = new URL(`${apiUrl}/${show}`);

  console.log(`Fetching from API URL: ${url}`);

  try {
    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      throw new Error("Videos request failed");
    }
    const data = await response.json();
    // console.log(data);
    return data;
  } catch (err) {
    console.error(err);
    throw new Error("Videos request failed");
  }
};

// FETCH SINGLE VIDEO
const fetchVideo = async (id: string) => {
  console.log("QUERY: ", id);
  console.log("fetchVideo: ", id);
  const apiUrl = process.env.NEXT_PUBLIC_TV_API_URL;

  if (!id) throw new Error("No id provided");
  const response = await fetch(`${apiUrl}/video/${id}`, { method: "GET" });
  if (!response.ok) {
    throw new Error("Video request failed");
  }
  return response.json();
};

const fetchShows = async () => {
  const storage = (await import("../../config/storage")).default;
  const apiUrl = process.env.NEXT_PUBLIC_TV_API_URL;
  // requestHeaders.set("Content-Type", "application/json;charset=UTF-8");
  const response = await fetch(`${apiUrl}/shows`, {
    method: "GET"
  })
    .then((response) => {
      if (!response.ok) throw new Error("Shows request failed");
      else return response.json();
    })
    .then((data) => console.log(data))
    .catch((err) => {
      console.log(err);
      throw new Error("Shows request failed");
    });
  // console.log(response)
  return response;
};

const useVideos = (show: string) => {
  return useQuery<IVideo[], false>([QueryKeys.VIDEOS, show, 1], () =>
    fetchVideos(show)
  );
};

const useVideo = (id: string) => {
  return useQuery<IVideo, false>([QueryKeys.VIDEO, id], () => fetchVideo(id));
};

const useShows = () => {
  return useQuery<any>([QueryKeys.SHOWS], () => fetchShows);
};

export { useVideos, useVideo, fetchVideos, fetchVideo, fetchShows, useShows };

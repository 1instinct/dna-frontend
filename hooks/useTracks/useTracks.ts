import { useQuery } from "react-query";
import { QueryKeys } from "../queryKeys";
import Soundcloud from "soundcloud.ts";

const fetchTracks = async (user: string = "") => {
  const scClient = new Soundcloud(
    process.env.NEXT_PUBLIC_SC_CLIENT_ID,
    process.env.NEXT_PUBLIC_SC_OAUTH_TOKEN
  );
  const response = await scClient.users
    .tracksV2(user)
    .then((res: any) => res)
    .catch((err) => {
      throw new Error("Tracks request failed");
    });
  // const response: any = await fetch("/api/corsProxy")
  //   .then((res: any) => {
  //     // console.log("res: ", res);
  //     return res;
  //   })
  //   .catch((err: any) => {
  //     throw Error(err);
  //   });
  return response;
};

const useTracks = (user: string) => {
  return useQuery<any, false>([QueryKeys.TRACKS, user], () =>
    fetchTracks(user)
  );
};

export { useTracks, fetchTracks };

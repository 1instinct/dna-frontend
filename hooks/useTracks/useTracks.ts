import { useQuery } from "react-query";
import { QueryKeys } from "../queryKeys";
// import Soundcloud from "soundcloud.ts";

const fetchTracks = async (user: string = "") => {
  // const scClient = new sc(
  //   process.env.NEXT_PUBLIC_SC_CLIENT_ID,
  //   // process.env.NEXT_PUBLIC_SC_OAUTH_TOKEN
  //   process.env.NEXT_PUBLIC_SC_CLIENT_SECRET
  // );
  // const response = await scClient.users
  //   .tracksV2(user)
  //   .then((res: any) => res)
  //   .catch((err: any) => {
  //     throw new Error("Tracks request failed: ", err);
  //   });
  // // const response: any = await fetch("/api/corsProxy")
  // //   .then((res: any) => {
  // //     // console.log("res: ", res);
  // //     return res;
  // //   })
  // //   .catch((err: any) => {
  // //     throw Error(err);
  // //   });
  // return response;

  return null
};

const useTracks = (user: string) => {
  return useQuery<any, false>([QueryKeys.TRACKS, user], () =>
    fetchTracks(user)
  );
};

export { useTracks, fetchTracks };

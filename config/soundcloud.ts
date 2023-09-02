import Soundcloud from "soundcloud.ts";

export const scClient = new Soundcloud(
  process.env.SOUNDCLOUD_CLIENT_ID,
  process.env.SOUNDCLOUD_OAUTH_TOKEN
);

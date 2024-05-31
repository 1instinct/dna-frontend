import Soundcloud from "soundcloud.ts";

export const scClient = new Soundcloud(
  process.env.SC_CLIENT_ID,
  process.env.SC_OAUTH_TOKEN
);

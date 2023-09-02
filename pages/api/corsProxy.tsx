import nc from "next-connect";
import cors from "cors";
import Soundcloud from "soundcloud.ts";

const corsProxy = nc()
  // use connect based middleware
  .use(cors())
  .get(async (req, res: any) => {
    // console.log("Starting API call");
    const sc = new Soundcloud(process.env.SOUNDCLOUD_CLIENT_ID, process.env.SOUNDCLOUD_OAUTH_TOKEN);
    // const scId = await sc.resolve.getV2("https://soundcloud.com/smokeyyy/");
    // const userTracks = await sc.playlists.fetch(scId);
    const userTracks = await sc.users.tracksV2("smokeyyy").then((res) => res);
    // console.log("Tracks", userTracks);
    // SC.initialize({
    //   client_id: `${process.env.SC_CLIENT_ID}`,
    //   redirect_uri: 'https://smokey.fm/player'
    // });
    // SC.get('/user/6319082/tracks')
    //   .then(tracks => {
    //     console.log('Latest tracks: ', tracks);
    //     return tracks.json();
    //   })
    //   .then(result => {
    //     this.setState({ songs: result[0].tracks }, () => this.GetUrl());
    //   },
    //   (error) => {}
    // );
    // fetch(
    //   "https://api.soundcloud.com/users/6319082/playlists?client_id=" +
    //     `${client_id}`
    // )
    //   .then((res) => res.json())
    //   .then(
    //     (result) => {
    //       this.setState({ songs: result[0].tracks }, () => this.GetUrl());
    //     },
    //     (error) => {}
    //   );

    res.json(userTracks);
    return res;
    // return userTracks
  });

export default corsProxy;

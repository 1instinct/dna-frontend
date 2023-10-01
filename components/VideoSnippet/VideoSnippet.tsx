import React from "react";
import moment from "moment";

import { Snippet, VidPic, VidDetails, Text, Date } from "./VideoSnippet.styles";
import { IVideo } from "../../typings";

interface VideoSnippetType {
  video: IVideo;
}

export const VideoSnippet = ({ video }: VideoSnippetType) => {
  const escapeHTML = (data) => {
    return { __html: data };
  };

  const formatDate = () => {
    let videoDate = video.date;
    return moment(videoDate).fromNow();
  };

  let title = video.title;
  let cleanTitle = title.replace(" | Galore TV", "");

  let params = { slug: video.slug };

  return (
    <Snippet href={""} itemProp="url">
      <VidPic image={video.thumb_mqdefault} />
      {/* <VidPic>
        <img src={video.thumb_mqdefault} itemProp="thumbnailUrl" alt={cleanTitle}></img>
      </VidPic> */}
      <VidDetails>
        <Text itemProp="name">{cleanTitle}</Text>
        <Date className="date">Posted {formatDate()}</Date>
      </VidDetails>
    </Snippet>
  );
};

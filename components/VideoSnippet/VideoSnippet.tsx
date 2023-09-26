import React from "react";
import moment from "moment";

import { Snippet, VidPic, VidDetails, Text, Date } from "./VideoSnippet.styles";

export const VideoSnippet = ({ vid }: any) => {
  const escapeHTML = (data) => {
    return { __html: data };
  };

  const formatDate = () => {
    let videoDate = vid.date;
    return moment(videoDate).fromNow();
  };

  let title = vid.title;
  let cleanTitle = title.replace(" | Galore TV", "");

  let params = { slug: vid.slug };

  return (
    <Snippet href={""} itemProp="url">
      <VidPic image={vid.thumb_mqdefault} />
      {/* <VidPic>
        <img src={vid.thumb_mqdefault} itemProp="thumbnailUrl" alt={cleanTitle}></img>
      </VidPic> */}
      <VidDetails>
        <Text itemProp="name">{cleanTitle}</Text>
        <Date className="date">Posted {formatDate()}</Date>
      </VidDetails>
    </Snippet>
  );
};

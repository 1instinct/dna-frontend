import React, { useEffect } from "react";
import moment from "moment";
import { Snippet, VidPic, VidDetails, Text, Date } from "./VideoSnippet.styles";
import { IVideo } from "../../typings";

interface VideoSnippetType {
  video: IVideo;
}

export const VideoSnippet = ({ video }: VideoSnippetType) => {
  // useEffect(() => {
  //   console.log("VideoSnippet: ", video.url);
  // }, [video]);

  // Check if video.url is in the expected format
  // if (typeof video.url !== "string") {
  //   // Render placeholder or loading indicator
  //   return <div>Loading...</div>;
  // }

  const escapeHTML = (data) => {
    return { __html: data };
  };

  const formatDate = () => {
    let videoDate = video.date;
    return moment(videoDate).fromNow();
  };

  let videoId = video.id;
  let title = video.title;
  let cleanTitle = title.replace(" | Galore TV", "");
  let slug = video.slug;

  return (
    <Snippet key={`video-${slug}`} href={`/video/${slug}?id=${videoId}`} itemProp="url">
      <VidPic image={video.thumb_mqdefault} />
      <VidDetails>
        <Text itemProp="name">{cleanTitle}</Text>
        <Date className="date">Posted {formatDate()}</Date>
      </VidDetails>
    </Snippet>
  );
};
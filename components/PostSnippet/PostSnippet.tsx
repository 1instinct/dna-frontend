import React from "react";
import moment from "moment";

import { Snippet, VidPic, VidDetails, Text, Date } from "./PostSnippet.styles";

export const PostSnippet = ({ post }) => {
  const formatDate = () => {
    let postDate = post.date;
    return moment(postDate).fromNow();
  };

  let vidLink = post.link;
  let thumb = post.thumb_smdefault;
  let newThumb = thumb.replace(/.*?:\/\//g, "//");

  return (
    <Snippet href={vidLink} target="_blank">
      <VidPic>
        <img src={newThumb} alt={post.title}></img>
      </VidPic>
      <VidDetails>
        <Text key={post.id} dangerouslySetInnerHTML={{ __html: post.title }} />
        <Date>Posted {formatDate()}</Date>
      </VidDetails>
    </Snippet>
  );
};

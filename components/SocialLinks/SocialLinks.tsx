import React from "react";
import { Facebook, Twitter, Instagram, YouTube } from "@material-ui/icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify, faSoundcloud, faLastfm } from '@fortawesome/free-brands-svg-icons';

import {
  SocialContainer,
  SocialList,
  SocialListItem,
  SocialIcon
} from "./SocialLinks.styles";

export const SocialLinks = ({ networks = [] }: { networks: string[] }) => {
  // Method to check if a network is in the passed array
  const isNetworkPresent = (network: string) => networks.includes(network);

  return (
    <SocialContainer>
      <SocialList>
        {isNetworkPresent("instagram") && (
          <SocialListItem>
            <a href={`http://www.instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_SLUG}`} target="_blank">
              <Instagram />
            </a>
          </SocialListItem>
        )}

        {isNetworkPresent("facebook") && (
          <SocialListItem>
            <a href={`http://www.facebook.com/${process.env.NEXT_PUBLIC_FACEBOOK_SLUG}`} target="_blank">
              <Facebook />
            </a>
          </SocialListItem>
        )}

        {isNetworkPresent("twitter") && (
          <SocialListItem>
            <a href={`http://www.twitter.com/${process.env.NEXT_PUBLIC_TWITTER_SLUG}`} target="_blank">
              <Twitter />
            </a>
          </SocialListItem>
        )}

        {isNetworkPresent("youtube") && (
          <SocialListItem>
            <a href={`http://www.youtube.com/${process.env.NEXT_PUBLIC_YOUTUBE_SLUG}`} target="_blank">
              <YouTube />
            </a>
          </SocialListItem>
        )}

        {isNetworkPresent("spotify") && (
          <SocialListItem>
            <a href="https://open.spotify.com/album/3FfuBJ7SkThWE5ZsxM8DZx?si=KmWYhLPTTXWQ2kYerZcjtQ" target="_blank">
              <FontAwesomeIcon icon={faSpotify} />
            </a>
          </SocialListItem>
        )}

        {isNetworkPresent("soundcloud") && (
          <SocialListItem>
            <a href="http://www.soundcloud.com/smokeyyy" target="_blank">
              <FontAwesomeIcon icon={faSoundcloud} />
            </a>
          </SocialListItem>
        )}

        {isNetworkPresent("lastfm") && (
          <SocialListItem>
            <a href="https://www.last.fm/music/Sky+Chase" target="_blank">
              <FontAwesomeIcon icon={faLastfm} />
            </a>
          </SocialListItem>
        )}
      </SocialList>
    </SocialContainer>
  );
};

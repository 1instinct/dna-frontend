import React from "react";

import {
  FeaturedSnippetWrapper,
  FeaturedSnippetBadge,
  FeaturedSnippetTitle,
  FeaturedSnippetSubtitle,
  FeaturedSnippetImage,
  FeaturedSnippetImageLink,
  FeaturedSnippetText,
  FeaturedSnippetButton,
  FeaturedSnippetLink,
} from "./FeaturedSnippet.styles";
import { SocialLinks } from "..";

export const FeaturedSnippet = () => {
  return (
    <FeaturedSnippetWrapper>
      <FeaturedSnippetBadge>New Release</FeaturedSnippetBadge>
      <FeaturedSnippetTitle>"Watermark"</FeaturedSnippetTitle>
      <FeaturedSnippetSubtitle>by Sky Chase</FeaturedSnippetSubtitle>
      <FeaturedSnippetImageLink href="https://open.spotify.com/album/3FfuBJ7SkThWE5ZsxM8DZx?si=KmWYhLPTTXWQ2kYerZcjtQ" target="_blank">
        <FeaturedSnippetImage src="images/SkyChase-Watermark.jpg" />
      </FeaturedSnippetImageLink>
      <FeaturedSnippetText>Now Streaming Everywhere</FeaturedSnippetText>
      <SocialLinks networks={["spotify", "soundcloud", "lastfm", "youtube"]} />
      {/* <FeaturedSnippetText>Checkout the latest release!</FeaturedSnippetText> */}
    </FeaturedSnippetWrapper>
  );
};

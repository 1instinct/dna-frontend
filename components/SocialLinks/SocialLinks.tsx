import React from "react";
import { Facebook, Twitter, Instagram } from "@material-ui/icons";

import {
  SocialContainer,
  SocialList,
  SocialListItem,
  SocialIcon
} from "./SocialLinks.styles";

export const SocialLinks = ({ darkMode }: any) => {
  return (
    <>
      <SocialContainer darkMode={darkMode}>
        <SocialList>
          <SocialListItem darkMode={darkMode}>
            <a
              href={
                `http://www.instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_SLUG}` ||
                "http://www.instagram.com"
              }
              target="_blank"
            >
              {/* <SocialIcon src="images/social-icon-instagram.png" /> */}
              <Instagram />{" "}
            </a>
          </SocialListItem>

          <SocialListItem darkMode={darkMode}>
            <a
              href={
                `http://www.facebook.com/${process.env.NEXT_PUBLIC_FACEBOOK_SLUG}` ||
                "http://www.facebook.com"
              }
              target="_blank"
            >
              {/* <SocialIcon src="images/social-icon-facebook.png" />{" "} */}
              <Facebook />{" "}
            </a>
          </SocialListItem>

          <SocialListItem darkMode={darkMode}>
            <a
              href={
                `http://www.twitter.com/${process.env.NEXT_PUBLIC_TWITTER_SLUG}` ||
                "http://www.twitter.com"
              }
              target="_blank"
            >
              {/* <SocialIcon src="images/social-icon-twitter.png" />{" "} */}
              <Twitter />{" "}
            </a>
          </SocialListItem>
        </SocialList>
      </SocialContainer>
    </>
  );
};

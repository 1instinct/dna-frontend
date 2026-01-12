import React from "react";
import { NotifyForm } from "@components/NotifyForm";
import {
  Container,
  ContentWrapper,
  PrivacyText,
  SocialLinks,
  SocialIcon
} from "./Newsletter.styles";

export interface NewsletterProps {
  title?: string | null;
  content?: string;
  backgroundColor?: string;
  privacyText?: string;
  showSocialLinks?: boolean;
}

const Newsletter: React.FC<NewsletterProps> = ({
  title,
  content,
  backgroundColor,
  privacyText,
  showSocialLinks = false
}) => {
  return (
    <Container backgroundColor={backgroundColor}>
      {title && <h2>{title}</h2>}
      {content && (
        <ContentWrapper dangerouslySetInnerHTML={{ __html: content }} />
      )}

      <NotifyForm />

      {privacyText && <PrivacyText>{privacyText}</PrivacyText>}

      {showSocialLinks && (
        <SocialLinks>
          <SocialIcon href="#" aria-label="Facebook">
            f
          </SocialIcon>
          <SocialIcon href="#" aria-label="Twitter">
            𝕏
          </SocialIcon>
          <SocialIcon href="#" aria-label="Instagram">
            📷
          </SocialIcon>
        </SocialLinks>
      )}
    </Container>
  );
};

export default Newsletter;

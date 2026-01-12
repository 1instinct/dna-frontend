import React from "react";
import { useRouter } from "next/router";
import { Container, Content, ActionButton } from "./CallToAction.styles";

export interface CallToActionProps {
  title?: string | null;
  content?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonLink?: string;
}

const CallToAction: React.FC<CallToActionProps> = ({
  title,
  content,
  backgroundColor,
  textColor,
  buttonText = "Learn More",
  buttonLink = "#"
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (buttonLink.startsWith("http")) {
      window.location.href = buttonLink;
    } else {
      router.push(buttonLink);
    }
  };

  return (
    <Container backgroundColor={backgroundColor} textColor={textColor}>
      <Content>
        {title && <h2>{title}</h2>}
        {content && <div dangerouslySetInnerHTML={{ __html: content }} />}

        {buttonText && (
          <ActionButton onClick={handleClick}>{buttonText}</ActionButton>
        )}
      </Content>
    </Container>
  );
};

export default CallToAction;

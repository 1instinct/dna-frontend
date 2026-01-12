import React from "react";
import {
  Container,
  FeatureGrid,
  FeatureCard,
  Icon,
  FeatureTitle,
  FeatureDescription
} from "./Features.styles";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesProps {
  features: Feature[];
  title?: string | null;
  content?: string;
}

const iconMap: Record<string, string> = {
  truck: "🚚",
  shield: "🛡️",
  refresh: "🔄",
  support: "💬",
  star: "⭐",
  check: "✓",
  heart: "❤️",
  gift: "🎁"
};

const Features: React.FC<FeaturesProps> = ({ features, title, content }) => {
  return (
    <Container>
      {title && <h2>{title}</h2>}
      {content && <div dangerouslySetInnerHTML={{ __html: content }} />}

      <FeatureGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <Icon>{iconMap[feature.icon] || "✨"}</Icon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeatureGrid>
    </Container>
  );
};

export default Features;

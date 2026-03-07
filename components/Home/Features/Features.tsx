import React from "react";

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
    <div className="mx-auto max-w-[1200px] px-5 py-16 text-center sm:py-10">
      {title && (
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-2xl">
          {title}
        </h2>
      )}
      {content && <div dangerouslySetInnerHTML={{ __html: content }} />}

      <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8 sm:grid-cols-1 sm:gap-5">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-lg glass-panel px-5 py-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 text-5xl">{iconMap[feature.icon] || "✨"}</div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-white/50">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;

import React from "react";
import { useRouter } from "next/router";

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
    <div
      className="px-5 py-20 text-center sm:py-16"
      style={{
        background: backgroundColor || "hsl(var(--brand))",
        color: textColor || "white"
      }}
    >
      <div className="mx-auto max-w-[800px]">
        {title && (
          <h2 className="mb-4 text-[2.5rem] font-bold sm:text-[1.75rem]">
            {title}
          </h2>
        )}
        {content && (
          <div
            className="mb-8 text-lg leading-relaxed sm:text-base [&_p]:mb-8 [&_p]:text-lg [&_p]:leading-relaxed sm:[&_p]:text-base"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        {buttonText && (
          <button
            onClick={handleClick}
            className="mt-4 rounded bg-white px-10 py-4 text-lg font-semibold text-brand transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-full sm:max-w-[300px]"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default CallToAction;

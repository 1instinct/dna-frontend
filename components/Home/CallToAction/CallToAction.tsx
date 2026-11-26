import React from "react";
import Link from "next/link";

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
  // A link, not a button: it navigates (and can open in a new tab).
  const linkClass =
    "mt-4 inline-block rounded bg-white px-10 py-4 text-lg font-semibold text-brand no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-full sm:max-w-[300px]";

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
        {buttonText &&
          (buttonLink.startsWith("http") ? (
            <a href={buttonLink} className={linkClass}>
              {buttonText}
            </a>
          ) : (
            <Link href={buttonLink} className={linkClass}>
              {buttonText}
            </Link>
          ))}
      </div>
    </div>
  );
};

export default CallToAction;

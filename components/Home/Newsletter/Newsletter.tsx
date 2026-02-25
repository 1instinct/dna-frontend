import React from "react";
import { NotifyForm } from "@components/NotifyForm";

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
    <div
      className="px-5 py-16 text-center sm:py-10"
      style={backgroundColor ? { background: backgroundColor } : undefined}
    >
      {title && (
        <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-2xl">
          {title}
        </h2>
      )}
      {content && (
        <div
          className="leading-relaxed text-muted-foreground [&_p]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      <NotifyForm />

      {privacyText && (
        <p className="mt-4 text-sm text-muted-foreground">{privacyText}</p>
      )}

      {showSocialLinks && (
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#"
            aria-label="Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand/80"
          >
            f
          </a>
          <a
            href="#"
            aria-label="Twitter"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand/80"
          >
            𝕏
          </a>
          <a
            href="#"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand/80"
          >
            📷
          </a>
        </div>
      )}
    </div>
  );
};

export default Newsletter;

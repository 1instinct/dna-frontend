import React from "react";
import { NotifyForm } from "@components/NotifyForm";

export interface NewsletterProps {
  title?: string | null;
  content?: string;
  backgroundColor?: string;
  privacyText?: string;
  showSocialLinks?: boolean;
}

// Only networks with a configured URL are shown; a link to "#" goes nowhere.
const socialLinks = [
  { label: "Facebook", glyph: "f", href: process.env.NEXT_PUBLIC_FACEBOOK_URL },
  {
    label: "X (Twitter)",
    glyph: "𝕏",
    href: process.env.NEXT_PUBLIC_TWITTER_URL
  },
  {
    label: "Instagram",
    glyph: "📷",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL
  }
].filter((link): link is { label: string; glyph: string; href: string } =>
  Boolean(link.href)
);

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

      {showSocialLinks && socialLinks.length > 0 && (
        <div className="mt-8 flex justify-center gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-label={link.label}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">{link.glyph}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Newsletter;

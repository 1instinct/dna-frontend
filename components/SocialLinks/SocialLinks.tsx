import React from "react";
import { Instagram, Facebook, Twitter } from "lucide-react";

export const SocialLinks = ({ darkMode }: any) => {
  const socialLinks = [
    {
      icon: Instagram,
      href: `http://www.instagram.com/${
        process.env.NEXT_PUBLIC_INSTAGRAM_SLUG || ""
      }`,
      label: "Instagram"
    },
    {
      icon: Facebook,
      href: `http://www.facebook.com/${
        process.env.NEXT_PUBLIC_FACEBOOK_SLUG || ""
      }`,
      label: "Facebook"
    },
    {
      icon: Twitter,
      href: `http://www.twitter.com/${
        process.env.NEXT_PUBLIC_TWITTER_SLUG || ""
      }`,
      label: "Twitter"
    }
  ];

  return (
    <div className="flex items-center justify-center gap-4">
      {socialLinks.map((social) => {
        const Icon = social.icon;
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-brand"
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
};

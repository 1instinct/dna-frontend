import React from "react";

export const LegalLinks = ({ darkMode, hasBackground }: any) => {
  const currentYear = new Date().getFullYear();
  const privacySlug = process.env.NEXT_PUBLIC_PRIVACY_SLUG || "/privacy";
  const termsSlug = process.env.NEXT_PUBLIC_TERMS_SLUG || "/terms";
  const siteName = process.env.NEXT_PUBLIC_SITE_TITLE || "Material Instinct";

  return (
    <div className="py-4 text-center font-body text-xs text-muted-foreground">
      <p>
        All materials copyright &copy; {currentYear}, {siteName}
      </p>
      <p className="mt-1">
        <a
          href={privacySlug}
          className="text-muted-foreground transition-colors hover:text-brand"
        >
          Privacy Policy
        </a>
        {" | "}
        <a
          href={termsSlug}
          className="text-muted-foreground transition-colors hover:text-brand"
        >
          Terms of Service
        </a>
      </p>
    </div>
  );
};

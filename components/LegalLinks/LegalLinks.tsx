import React from "react";

import {
  LegalContainer,
  LegalRow,
  LegalColumn,
  LegalLink
} from "./LegalLinks.styles";

export const LegalLinks = ({ darkMode, hasBackground }: any) => {
  const currentYear = new Date().getFullYear();
  const privacySlug = process.env.NEXT_PUBLIC_PRIVACY_SLUG || "/privacy";
  const termsSlug = process.env.NEXT_PUBLIC_TERMS_SLUG || "/terms";
  return (
    <LegalContainer darkMode={darkMode} hasBackground={hasBackground}>
      <LegalRow>
        All materials copyright © {currentYear}, Material Instinct LLC
      </LegalRow>
      <LegalRow>
        <LegalColumn>
          <LegalLink
            darkMode={darkMode}
            href={privacySlug}
          >
            Privacy Policy
          </LegalLink>
        </LegalColumn>
        {` | `}
        <LegalColumn>
          <LegalLink darkMode={darkMode} href={termsSlug}>
            Terms of Service
          </LegalLink>
        </LegalColumn>
      </LegalRow>
    </LegalContainer>
  );
};

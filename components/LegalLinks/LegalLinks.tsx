import React from "react";

import {
  LegalContainer,
  LegalRow,
  LegalColumn,
  LegalLink
} from "./LegalLinks.styles";

export const LegalLinks = ({ darkMode, hasBackground }: any) => {
    const currentYear = new Date().getFullYear();
    return (
        <LegalContainer darkMode={darkMode} hasBackground={hasBackground}>
        <LegalRow>
            All materials copyright © {currentYear}, Material Instinct LLC
        </LegalRow>
        <LegalRow>
            <LegalColumn>
            <LegalLink
                darkMode={darkMode}
                href={process.env.NEXT_PUBLIC_LEGAL_SLUG}
            >
                Privacy Policy
            </LegalLink>
            </LegalColumn>
            <LegalColumn>
            <LegalLink darkMode={darkMode} href="/terms-of-service">
                Terms of Service
            </LegalLink>
            </LegalColumn>
        </LegalRow>
        </LegalContainer>
    );
};

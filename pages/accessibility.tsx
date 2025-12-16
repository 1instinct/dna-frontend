import React from "react";
import styled from "@emotion/styled";
import { Layout } from "../components";

const Page = styled.section`
  max-width: 960px;
  margin: 0 auto;
  padding: 64px 24px 120px;
  line-height: 1.6;
  color: ${(p) => p.theme.colors.black.primary};
`;

const Title = styled.h1`
  font-size: 32px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 18px;
`;

const Subhead = styled.h2`
  font-size: 20px;
  margin-top: 32px;
  margin-bottom: 12px;
`;

const Paragraph = styled.p`
  margin: 0 0 16px 0;
`;

const AccessibilityPage = () => (
  <Layout>
    <Page>
      <Title>Accessibility Statement</Title>
      <Paragraph>
        We are committed to providing an accessible experience for all visitors
        to this site. Our goal is to conform to WCAG 2.1 AA standards wherever
        possible and to continuously improve the experience for everyone.
      </Paragraph>
      <Subhead>Need assistance?</Subhead>
      <Paragraph>
        If you have difficulty using any part of our site, notice anything that
        is not accessible, or need materials in an alternative format, please
        contact us at{" "}
        <a href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL}`}>
          {process.env.NEXT_PUBLIC_COMPANY_EMAIL}
        </a>{" "}
        or call {process.env.NEXT_PUBLIC_COMPANY_PHONE || "(310) 715-1370"}.
        Please include the page you were on and the issue you encountered.
      </Paragraph>
      <Subhead>Ongoing improvements</Subhead>
      <Paragraph>
        We regularly review our site, remediate issues, and explore new
        solutions to make sure our content, forms, media, and navigation remain
        usable for everyone.
      </Paragraph>
    </Page>
  </Layout>
);

export default AccessibilityPage;

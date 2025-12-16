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

const CAPrivacyPage = () => (
  <Layout>
    <Page>
      <Title>California Privacy Rights</Title>
      <Paragraph>
        California residents may request access to the personal information we
        collect, request deletion, and opt out of certain sharing or selling of
        personal information, consistent with the California Consumer Privacy
        Act (CCPA) and the California Privacy Rights Act (CPRA).
      </Paragraph>
      <Subhead>Your rights</Subhead>
      <Paragraph>
        • Request to know the categories and specific pieces of personal
        information we collect, use, disclose, and share.
        <br />
        • Request deletion of your personal information, subject to applicable
        exceptions.
        <br />
        • Opt out of the sale or sharing of personal information (we do not sell
        personal information, but honor opt-out signals).
      </Paragraph>
      <Subhead>How to make a request</Subhead>
      <Paragraph>
        To exercise your rights, contact us at{" "}
        <a href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL}`}>
          {process.env.NEXT_PUBLIC_COMPANY_EMAIL}
        </a>{" "}
        or call {process.env.NEXT_PUBLIC_COMPANY_PHONE || "(310) 715-1370"}.
        Please identify the request type and provide enough detail to allow us
        to verify your identity. Authorized agents may submit a request on your
        behalf with proof of authorization.
      </Paragraph>
      <Subhead>Non-discrimination</Subhead>
      <Paragraph>
        We will not discriminate against you for exercising your privacy rights.
      </Paragraph>
    </Page>
  </Layout>
);

export default CAPrivacyPage;

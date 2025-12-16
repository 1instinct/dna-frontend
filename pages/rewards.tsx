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

const RewardsPage = () => (
  <Layout>
    <Page>
      <Title>Rewards</Title>
      <Paragraph>
        Earn perks when you shop with us. Enrolled customers can receive points
        on qualifying purchases, special offers, and early access to drops.
        Exact program details may vary and are subject to change.
      </Paragraph>
      <Subhead>How it works</Subhead>
      <Paragraph>
        • Create an account or sign in to begin earning. <br />
        • Points and rewards are issued to the email tied to your account.{" "}
        <br />
        • Rewards may have expiration dates or exclusions; see offer details.
      </Paragraph>
      <Subhead>Questions?</Subhead>
      <Paragraph>
        Contact us at{" "}
        <a href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL}`}>
          {process.env.NEXT_PUBLIC_COMPANY_EMAIL}
        </a>{" "}
        or {process.env.NEXT_PUBLIC_COMPANY_PHONE || "(310) 715-1370"} for
        assistance with your rewards.
      </Paragraph>
    </Page>
  </Layout>
);

export default RewardsPage;

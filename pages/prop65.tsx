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

const Prop65Page = () => (
  <Layout>
    <Page>
      <Title>California Proposition 65 Warning</Title>
      <Paragraph>
        Some products sold on this site may contain chemicals known to the State
        of California to cause cancer, birth defects, or other reproductive
        harm. These products will include a Proposition 65 warning label where
        required.
      </Paragraph>
      <Subhead>What is Prop 65?</Subhead>
      <Paragraph>
        Proposition 65 (The Safe Drinking Water and Toxic Enforcement Act of
        1986) requires businesses to provide warnings to Californians about
        exposures to chemicals on the Prop 65 list. The list is updated annually
        by the State of California.
      </Paragraph>
      <Subhead>Your choices</Subhead>
      <Paragraph>
        If you would like more information about any product you are purchasing,
        contact us at{" "}
        <a href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL}`}>
          {process.env.NEXT_PUBLIC_COMPANY_EMAIL}
        </a>{" "}
        or call {process.env.NEXT_PUBLIC_COMPANY_PHONE || "(310) 715-1370"}.
      </Paragraph>
    </Page>
  </Layout>
);

export default Prop65Page;

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

const ReturnsPage = () => (
  <Layout>
    <Page>
      <Title>Returns, Exchanges & Damages</Title>
      <Paragraph>
        We want you to love your order. If something isn’t right, you can
        request a return or exchange within 14 days of delivery, subject to the
        conditions below.
      </Paragraph>
      <Subhead>Return & exchange guidelines</Subhead>
      <Paragraph>
        • Items must be unworn, unwashed, and in original condition with tags
        attached. <br />
        • Final-sale items are not eligible for return or exchange. <br />
        • Exchanges are subject to inventory availability; otherwise a refund
        will be issued to the original form of payment.
      </Paragraph>
      <Subhead>Damaged or incorrect items</Subhead>
      <Paragraph>
        If you receive a damaged or incorrect item, contact us within 7 days of
        delivery with your order number and photos. We’ll work quickly to make
        it right.
      </Paragraph>
      <Subhead>How to start a return</Subhead>
      <Paragraph>
        Email{" "}
        <a href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL}`}>
          {process.env.NEXT_PUBLIC_COMPANY_EMAIL}
        </a>{" "}
        with your order number, item details, and reason for return. You can
        also reach us at {process.env.NEXT_PUBLIC_COMPANY_PHONE || "(310) 715-1370"}.
      </Paragraph>
    </Page>
  </Layout>
);

export default ReturnsPage;

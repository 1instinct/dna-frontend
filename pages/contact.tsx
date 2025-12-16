import React from "react";
import styled from "@emotion/styled";
import { Layout } from "../components";

const ContactSection = styled.section`
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  background: ${({ theme }) =>
    theme?.background?.AmbientVectors || "linear-gradient(180deg, #EB8B8B 0%, #CC8BEB 100%)"};
  color: ${({ theme }) => theme?.colors?.white?.primary || "#fff"};
  text-align: center;
`;

const Card = styled.div`
  max-width: 520px;
  width: 100%;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 18px;
  padding: 32px 28px;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
`;

const Title = styled.h1`
  margin: 0 0 12px 0;
  font-size: 32px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const Body = styled.p`
  margin: 0 0 28px 0;
  font-size: 16px;
  line-height: 1.5;
  color: ${({ theme }) => theme?.colors?.white?.medium || "#f2f2f2"};
`;

const ContactButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 22px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: ${({ theme }) => theme?.colors?.white?.primary || "#fff"};
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.08);
  transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.18);
  }
`;

const ContactPage = () => {
  const email = process.env.NEXT_PUBLIC_COMPANY_EMAIL || "hello@instinct.is";
  const phone = process.env.NEXT_PUBLIC_COMPANY_PHONE || "+1-917-300-8103";
  const mailtoHref = `mailto:${email}`;

  return (
    <Layout>
      <ContactSection>
        <Card>
          <Title>Contact Us</Title>
          <Body>
            We would love to hear from you. Drop us a note and we will get back
            to you as soon as we can, or call us at {phone}.
          </Body>
          <ContactButton href={mailtoHref}>Email the team</ContactButton>
        </Card>
      </ContactSection>
    </Layout>
  );
};

export default ContactPage;

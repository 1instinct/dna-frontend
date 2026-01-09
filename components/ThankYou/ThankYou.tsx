import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Layout } from "../components";
import { useOrder } from "../../hooks";
import { useAuth } from "../../config/auth";
import styled from "@emotion/styled";

const ThankYouContainer = styled.div`
  max-width: 800px;
  margin: 80px auto;
  padding: 40px 20px;
  text-align: center;
`;

const SuccessIcon = styled.div`
  font-size: 80px;
  color: #4caf50;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-family: ${(p) => p.theme.typography.titleLG.fontFamily};
  font-size: ${(p) => p.theme.typography.titleLG.fontSize};
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  font-family: ${(p) => p.theme.typography.bodyLG.fontFamily};
  font-size: ${(p) => p.theme.typography.bodyLG.fontSize};
  color: ${(p) => p.theme.colors.gray.primary || "#666"};
  margin-bottom: 30px;
`;

const OrderNumber = styled.div`
  background: ${(p) => p.theme.colors.gray.primary || "#f5f5f5"};
  padding: 20px;
  border-radius: 8px;
  margin: 30px 0;
`;

const OrderLabel = styled.div`
  font-size: 14px;
  color: ${(p) => p.theme.colors.gray.primary || "#666"};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const OrderValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  font-family: monospace;
`;

const InfoBox = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 30px 0;
  text-align: left;
`;

const InfoTitle = styled.h3`
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  margin-bottom: 15px;
`;

const InfoText = styled.p`
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};
  line-height: 1.6;
  color: ${(p) => p.theme.colors.gray.primary || "#333"};
  margin-bottom: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  padding: 14px 30px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${(p) =>
    p.variant === "primary"
      ? `
    background-color: ${p.theme.colors.brand.primary};
    color: white;
    
    &:hover {
      background-color: ${p.theme.colors.brand.secondary};
    }
  `
      : `
    background-color: white;
    color: ${p.theme.colors.brand.primary};
    border: 2px solid ${p.theme.colors.brand.primary};
    
    &:hover {
      background-color: ${p.theme.colors.gray.primary || "#f5f5f5"};
    }
  `}
`;

export const ThankYou = () => {
  const router = useRouter();
  const { order: orderNumber, token: orderToken } = router.query;
  const { user } = useAuth();
  const { data: orderData, isLoading } = useOrder(
    orderNumber as string,
    orderToken as string
  );

  useEffect(() => {
    // Track successful order
    if (orderNumber) {
      console.log("Order completed:", orderNumber);
      // You can add analytics tracking here
    }
  }, [orderNumber]);

  const order = orderData?.data;

  return (
    <Layout>
      <ThankYouContainer>
        <SuccessIcon>✓</SuccessIcon>
        <Title>Thank You for Your Order!</Title>
        <Subtitle>
          Your order has been successfully placed and is being processed.
        </Subtitle>

        {orderNumber && (
          <OrderNumber>
            <OrderLabel>Order Number</OrderLabel>
            <OrderValue>{orderNumber}</OrderValue>
          </OrderNumber>
        )}

        {!isLoading && order && (
          <InfoBox>
            <InfoTitle>Order Summary</InfoTitle>
            <InfoText>
              <strong>Email:</strong> {order.attributes.email}
            </InfoText>
            <InfoText>
              <strong>Total:</strong> {order.attributes.display_total}
            </InfoText>
            <InfoText>
              <strong>Items:</strong> {order.attributes.item_count}
            </InfoText>
          </InfoBox>
        )}

        <InfoBox>
          <InfoTitle>What happens next?</InfoTitle>
          <InfoText>
            📧 You'll receive an email confirmation shortly with your order
            details and tracking information.
          </InfoText>
          <InfoText>
            📦 We'll notify you when your order ships, typically within 1-2
            business days.
          </InfoText>
          <InfoText>
            🚚 Track your shipment using the tracking number in your
            confirmation email.
          </InfoText>
        </InfoBox>

        <InfoBox>
          <InfoTitle>Need Help?</InfoTitle>
          <InfoText>
            If you have any questions about your order, please don't hesitate to
            contact our customer support team.
          </InfoText>
          <InfoText>
            Email:{" "}
            {process.env.NEXT_PUBLIC_EMAIL || "hello@instinct.is"}
          </InfoText>
          <InfoText>
            Phone: {process.env.NEXT_PUBLIC_COMPANY_PHONE || "1-800-000-0000"}
          </InfoText>
        </InfoBox>

        <ButtonGroup>
          <Button variant="primary" onClick={() => router.push("/")}>
            Continue Shopping
          </Button>
          {user ? (
            <Button
              variant="secondary"
              onClick={() => router.push("/account/orders")}
            >
              View Order History
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => router.push(`/account/orders/${orderNumber}`)}
            >
              View Order Details
            </Button>
          )}
        </ButtonGroup>
      </ThankYouContainer>
    </Layout>
  );
};

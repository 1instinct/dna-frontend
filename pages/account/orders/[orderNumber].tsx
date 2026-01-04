import React from "react";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import { Layout, Loading } from "../../../components";
import { useOrder } from "../../../hooks";

const Container = styled.div`
  max-width: 1000px;
  margin: 80px auto;
  padding: 20px;
`;

const BackButton = styled.button`
  padding: 10px 20px;
  background: transparent;
  border: 2px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 30px;
  transition: all 0.2s;

  &:hover {
    background: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.black.primary
        : p.theme.colors.white.primary};
  }
`;

const Title = styled.h1`
  font-family: ${(p) => p.theme.typography.titleLG.fontFamily};
  font-size: 33px;
  text-transform: uppercase;
  margin-bottom: 10px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

const OrderNumber = styled.div`
  font-family: monospace;
  font-size: 20px;
  color: ${(p) => (p.theme.isDarkMode ? "#999" : "#666")};
  margin-bottom: 40px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: ${(p) => (p.theme.isDarkMode ? "#1a1a1a" : "white")};
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  font-size: 20px;
  text-transform: uppercase;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid
    ${(p) => (p.theme.isDarkMode ? "#2a2a2a" : "#e0e0e0")};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

const LineItem = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid
    ${(p) => (p.theme.isDarkMode ? "#2a2a2a" : "#e0e0e0")};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  background: ${(p) => (p.theme.isDarkMode ? "#2a2a2a" : "#f5f5f5")};
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

const ItemDetails = styled.div`
  font-size: 14px;
  color: ${(p) => (p.theme.isDarkMode ? "#999" : "#666")};
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  min-width: 80px;
  text-align: right;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

const Label = styled.span`
  color: ${(p) => (p.theme.isDarkMode ? "#999" : "#666")};
`;

const Value = styled.span`
  font-weight: 600;
`;

const TotalRow = styled(InfoRow)`
  font-size: 20px;
  padding-top: 20px;
  margin-top: 10px;
  border-top: 2px solid ${(p) => (p.theme.isDarkMode ? "#2a2a2a" : "#e0e0e0")};
`;

const AddressBlock = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AddressTitle = styled.div`
  font-weight: 600;
  margin-bottom: 10px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

const AddressLine = styled.div`
  color: ${(p) => (p.theme.isDarkMode ? "#999" : "#666")};
  line-height: 1.6;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;

  ${(p) => {
    switch (p.status) {
      case "complete":
        return `
          background: #e8f5e9;
          color: #2e7d32;
        `;
      case "shipped":
        return `
          background: #e3f2fd;
          color: #1565c0;
        `;
      case "processing":
        return `
          background: #fff3e0;
          color: #ef6c00;
        `;
      case "canceled":
        return `
          background: #ffebee;
          color: #c62828;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
        `;
    }
  }}
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${(p) => (p.theme.isDarkMode ? "#999" : "#666")};
`;

export const OrderDetail = () => {
  const router = useRouter();
  const { orderNumber } = router.query;

  const { data: orderData, isLoading, error } = useOrder(orderNumber as string);

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (error || !orderData) {
    return (
      <Layout>
        <Container>
          <BackButton onClick={() => router.push("/account/orders")}>
            ← Back to Orders
          </BackButton>
          <ErrorMessage>
            <h3>Order not found</h3>
            <p>
              We couldn't find this order. Please check the order number and try
              again.
            </p>
          </ErrorMessage>
        </Container>
      </Layout>
    );
  }

  const order = orderData.data;
  const lineItems =
    orderData.included?.filter((item: any) => item.type === "line_item") || [];
  const variants =
    orderData.included?.filter((item: any) => item.type === "variant") || [];
  const shippingAddressData = order.relationships.shipping_address?.data;
  const shippingAddressId = Array.isArray(shippingAddressData)
    ? shippingAddressData[0]?.id
    : shippingAddressData?.id;
  const shippingAddress = orderData.included?.find(
    (item: any) => item.type === "address" && item.id === shippingAddressId
  );
  const billingAddressData = order.relationships.billing_address?.data;
  const billingAddressId = Array.isArray(billingAddressData)
    ? billingAddressData[0]?.id
    : billingAddressData?.id;
  const billingAddress = orderData.included?.find(
    (item: any) => item.type === "address" && item.id === billingAddressId
  );

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Layout>
      <Container>
        <BackButton onClick={() => router.push("/account/orders")}>
          ← Back to Orders
        </BackButton>

        <Title>Order Details</Title>
        <OrderNumber>Order #{order.attributes.number}</OrderNumber>

        <Grid>
          <div>
            <Section>
              <SectionTitle>
                Order Items ({order.attributes.item_count})
              </SectionTitle>
              {lineItems.map((item: any) => {
                const variant = variants.find(
                  (v: any) => v.id === item.relationships.variant.data.id
                );
                return (
                  <LineItem key={item.id}>
                    <ItemImage
                      src="/placeholder.png"
                      alt={item.attributes.name}
                    />
                    <ItemInfo>
                      <ItemName>{item.attributes.name}</ItemName>
                      <ItemDetails>
                        Quantity: {item.attributes.quantity}
                      </ItemDetails>
                      {variant && (
                        <ItemDetails>SKU: {variant.attributes.sku}</ItemDetails>
                      )}
                    </ItemInfo>
                    <ItemPrice>{item.attributes.display_total}</ItemPrice>
                  </LineItem>
                );
              })}
            </Section>

            {shippingAddress && (
              <Section style={{ marginTop: "30px" }}>
                <SectionTitle>Shipping & Billing</SectionTitle>
                <AddressBlock>
                  <AddressTitle>Shipping Address</AddressTitle>
                  <AddressLine>
                    {shippingAddress.attributes.firstname}{" "}
                    {shippingAddress.attributes.lastname}
                  </AddressLine>
                  <AddressLine>
                    {shippingAddress.attributes.address1}
                  </AddressLine>
                  {shippingAddress.attributes.address2 && (
                    <AddressLine>
                      {shippingAddress.attributes.address2}
                    </AddressLine>
                  )}
                  <AddressLine>
                    {shippingAddress.attributes.city},{" "}
                    {shippingAddress.attributes.state_name}{" "}
                    {shippingAddress.attributes.zipcode}
                  </AddressLine>
                  <AddressLine>{shippingAddress.attributes.phone}</AddressLine>
                </AddressBlock>

                {billingAddress && (
                  <AddressBlock>
                    <AddressTitle>Billing Address</AddressTitle>
                    <AddressLine>
                      {billingAddress.attributes.firstname}{" "}
                      {billingAddress.attributes.lastname}
                    </AddressLine>
                    <AddressLine>
                      {billingAddress.attributes.address1}
                    </AddressLine>
                    {billingAddress.attributes.address2 && (
                      <AddressLine>
                        {billingAddress.attributes.address2}
                      </AddressLine>
                    )}
                    <AddressLine>
                      {billingAddress.attributes.city},{" "}
                      {billingAddress.attributes.state_name}{" "}
                      {billingAddress.attributes.zipcode}
                    </AddressLine>
                    <AddressLine>{billingAddress.attributes.phone}</AddressLine>
                  </AddressBlock>
                )}
              </Section>
            )}
          </div>

          <div>
            <Section>
              <SectionTitle>Order Summary</SectionTitle>
              <InfoRow>
                <Label>Status:</Label>
                <StatusBadge status={order.attributes.state}>
                  {order.attributes.state}
                </StatusBadge>
              </InfoRow>
              <InfoRow>
                <Label>Order Date:</Label>
                <Value>{formatDate(order.attributes.created_at)}</Value>
              </InfoRow>
              {order.attributes.completed_at && (
                <InfoRow>
                  <Label>Completed:</Label>
                  <Value>{formatDate(order.attributes.completed_at)}</Value>
                </InfoRow>
              )}
              <InfoRow>
                <Label>Email:</Label>
                <Value>{order.attributes.email}</Value>
              </InfoRow>
            </Section>

            <Section style={{ marginTop: "30px" }}>
              <SectionTitle>Order Total</SectionTitle>
              <InfoRow>
                <Label>Subtotal:</Label>
                <Value>{order.attributes.display_item_total}</Value>
              </InfoRow>
              <InfoRow>
                <Label>Shipping:</Label>
                <Value>{order.attributes.display_ship_total}</Value>
              </InfoRow>
              <InfoRow>
                <Label>Tax:</Label>
                <Value>{order.attributes.display_tax_total}</Value>
              </InfoRow>
              {order.attributes.promo_total && (
                <InfoRow>
                  <Label>Discount:</Label>
                  <Value style={{ color: "#2e7d32" }}>
                    {order.attributes.display_promo_total}
                  </Value>
                </InfoRow>
              )}
              <TotalRow>
                <Label>Total:</Label>
                <Value>{order.attributes.display_total}</Value>
              </TotalRow>
            </Section>
          </div>
        </Grid>
      </Container>
    </Layout>
  );
};

export default OrderDetail;

import React, { useState } from "react";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import { Layout, Loading } from "../../components";
import { useOrders } from "../../hooks";
import { useAuth } from "../../config/auth";
const Container = styled.div`
  max-width: 1200px;
  margin: 80px auto;
  padding: 20px;
`;

const Title = styled.h1`
  font-family: ${(p) => p.theme.typography.titleLG.fontFamily};
  font-size: 33px;
  text-transform: uppercase;
  margin-bottom: 40px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

const OrdersTable = styled.div`
  width: 100%;
  background: ${(p) => (p.theme.isDarkMode ? "#1a1a1a" : "white")};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 120px;
  gap: 20px;
  padding: 20px;
  background: ${(p) => (p.theme.isDarkMode ? "#2a2a2a" : "#f5f5f5")};
  border-bottom: 2px solid
    ${(p) => (p.theme.isDarkMode ? "#3a3a3a" : "#e0e0e0")};
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};

  @media (max-width: 900px) {
    display: none;
  }
`;

const OrderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 120px;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid
    ${(p) => (p.theme.isDarkMode ? "#2a2a2a" : "#e0e0e0")};
  align-items: center;
  transition: background 0.2s;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};

  &:hover {
    background: ${(p) => (p.theme.isDarkMode ? "#252525" : "#f9f9f9")};
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 20px 15px;
  }
`;

const OrderCell = styled.div`
  font-size: 14px;

  @media (max-width: 900px) {
    &:before {
      content: attr(data-label);
      font-weight: 600;
      text-transform: uppercase;
      margin-right: 10px;
      font-size: 12px;
      color: ${(p) => (p.theme.isDarkMode ? "#999" : "#666")};
    }
  }
`;

const OrderNumber = styled.div`
  font-weight: 600;
  font-family: monospace;
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

const ViewButton = styled.button`
  padding: 8px 16px;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.white.primary};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${(p) => (p.theme.isDarkMode ? "#999" : "#666")};
`;

const EmptyTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  margin-bottom: 30px;
`;

const ShopButton = styled.button`
  padding: 12px 30px;
  background: ${(p) => p.theme.colors.brand.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  transition: background 0.2s;

  &:hover {
    background: ${(p) => p.theme.colors.brand.secondary};
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const LoginButton = styled.button`
  padding: 12px 30px;
  background: ${(p) => p.theme.colors.brand.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 20px;
  transition: background 0.2s;

  &:hover {
    background: ${(p) => p.theme.colors.brand.secondary};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${(p) => (p.theme.isDarkMode ? "#3a3a3a" : "#e0e0e0")};
  background: ${(p) =>
    p.active
      ? p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary
      : p.theme.isDarkMode
      ? "#1a1a1a"
      : "white"};
  color: ${(p) =>
    p.active
      ? p.theme.isDarkMode
        ? p.theme.colors.black.primary
        : p.theme.colors.white.primary
      : p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  border-radius: 4px;
  cursor: pointer;
  font-weight: ${(p) => (p.active ? "600" : "normal")};
  transition: all 0.2s;

  &:hover {
    background: ${(p) => (p.theme.isDarkMode ? "#2a2a2a" : "#f5f5f5")};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const Account = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: ordersData, isLoading, error } = useOrders(currentPage);

  if (!user) {
    return (
      <Layout>
        <Container>
          <LoginPrompt>
            <Title>My Orders</Title>
            <EmptyText>Please log in to view your order history.</EmptyText>
            <LoginButton onClick={() => router.push("/login")}>
              Log In
            </LoginButton>
          </LoginPrompt>
        </Container>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container>
          <Title>My Orders</Title>
          <EmptyState>
            <EmptyTitle>Unable to load orders</EmptyTitle>
            <EmptyText>Please try again later or contact support.</EmptyText>
          </EmptyState>
        </Container>
      </Layout>
    );
  }

  const orders = ordersData?.data || [];
  const totalPages = ordersData?.meta?.total_pages || 1;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <Layout>
      <Container>
        <Title>My Orders</Title>

        {orders.length === 0 ? (
          <EmptyState>
            <EmptyTitle>No orders yet</EmptyTitle>
            <EmptyText>Start shopping to see your orders here!</EmptyText>
            <ShopButton onClick={() => router.push("/")}>
              Start Shopping
            </ShopButton>
          </EmptyState>
        ) : (
          <>
            <OrdersTable>
              <TableHeader>
                <div>Order Date</div>
                <div>Order Number</div>
                <div>Status</div>
                <div>Items</div>
                <div>Total</div>
                <div></div>
              </TableHeader>

              {orders.map((order: any) => (
                <OrderRow key={order.id}>
                  <OrderCell data-label="Date:">
                    {formatDate(
                      order.attributes.completed_at ||
                        order.attributes.created_at
                    )}
                  </OrderCell>
                  <OrderCell data-label="Order #:">
                    <OrderNumber>{order.attributes.number}</OrderNumber>
                  </OrderCell>
                  <OrderCell data-label="Status:">
                    <StatusBadge status={order.attributes.state}>
                      {order.attributes.state}
                    </StatusBadge>
                  </OrderCell>
                  <OrderCell data-label="Items:">
                    {order.attributes.item_count} items
                  </OrderCell>
                  <OrderCell data-label="Total:">
                    {order.attributes.display_total}
                  </OrderCell>
                  <OrderCell>
                    <ViewButton
                      onClick={() =>
                        router.push(
                          `/account/orders/${order.attributes.number}`
                        )
                      }
                    >
                      View
                    </ViewButton>
                  </OrderCell>
                </OrderRow>
              ))}
            </OrdersTable>

            {totalPages > 1 && (
              <Pagination>
                <PageButton
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </PageButton>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PageButton
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PageButton>
                  )
                )}
                <PageButton
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </PageButton>
              </Pagination>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Account;

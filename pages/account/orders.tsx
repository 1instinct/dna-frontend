import React, { useState } from "react";
import { useRouter } from "next/router";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@lib/utils";
import { Layout } from "../../components/Layout";
import { Loading } from "../../components/Loading";
import { Button } from "@components/ui";
import { useOrders } from "../../hooks";
import { useAuth } from "../../config/auth";

const statusStyles: Record<string, string> = {
  complete: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  processing: "bg-amber-100 text-amber-800",
  canceled: "bg-red-100 text-red-800"
};

const getStatusClass = (status: string) =>
  statusStyles[status] || "bg-muted text-muted-foreground";

export const Account = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: ordersData, isLoading, error } = useOrders(currentPage);

  if (!user) {
    return (
      <Layout>
        <div className="section-container py-10">
          <div className="flex flex-col items-center justify-center rounded-xl bg-card px-5 py-20 text-center">
            <h1 className="mb-3 font-title text-2xl font-bold uppercase text-foreground">
              My Orders
            </h1>
            <p className="mb-6 font-body text-sm text-muted-foreground">
              Please log in to view your order history.
            </p>
            <Button onClick={() => router.push("/login")}>Log In</Button>
          </div>
        </div>
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
        <div className="section-container py-10">
          <h1 className="mb-6 font-title text-3xl font-bold uppercase tracking-wider text-foreground">
            My Orders
          </h1>
          <div className="flex flex-col items-center justify-center rounded-xl bg-card px-5 py-20 text-center">
            <h2 className="mb-3 font-title text-lg text-foreground">
              Unable to load orders
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              Please try again later or contact support.
            </p>
          </div>
        </div>
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
      <div className="section-container py-10">
        <h1 className="mb-6 font-title text-3xl font-bold uppercase tracking-wider text-foreground">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-card px-5 py-20 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h2 className="mb-3 font-title text-lg text-foreground">
              No orders yet
            </h2>
            <p className="mb-6 font-body text-sm text-muted-foreground">
              Start shopping to see your orders here!
            </p>
            <Button onClick={() => router.push("/")}>Start Shopping</Button>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-border/30 bg-card shadow-sm">
              {/* Table Header - Desktop */}
              <div className="hidden grid-cols-[1fr_1.5fr_1fr_1fr_1fr_120px] gap-5 border-b-2 border-border/30 bg-muted/50 px-5 py-4 font-title text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
                <div>Order Date</div>
                <div>Order Number</div>
                <div>Status</div>
                <div>Items</div>
                <div>Total</div>
                <div></div>
              </div>

              {/* Order Rows */}
              {orders.map((order: any) => (
                <div
                  key={order.id}
                  className="grid grid-cols-1 gap-2.5 border-b border-border/20 px-5 py-4 text-sm text-foreground transition-colors last:border-b-0 hover:bg-muted/30 md:grid-cols-[1fr_1.5fr_1fr_1fr_1fr_120px] md:items-center md:gap-5"
                >
                  <div className="font-body">
                    <span className="mr-2 font-semibold uppercase text-muted-foreground md:hidden">
                      Date:
                    </span>
                    {formatDate(
                      order.attributes.completed_at ||
                        order.attributes.created_at
                    )}
                  </div>
                  <div>
                    <span className="mr-2 font-semibold uppercase text-muted-foreground md:hidden">
                      Order #:
                    </span>
                    <span className="font-mono font-semibold">
                      {order.attributes.number}
                    </span>
                  </div>
                  <div>
                    <span className="mr-2 font-semibold uppercase text-muted-foreground md:hidden">
                      Status:
                    </span>
                    <span
                      className={cn(
                        "inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase",
                        getStatusClass(order.attributes.state)
                      )}
                    >
                      {order.attributes.state}
                    </span>
                  </div>
                  <div className="font-body">
                    <span className="mr-2 font-semibold uppercase text-muted-foreground md:hidden">
                      Items:
                    </span>
                    {order.attributes.item_count} items
                  </div>
                  <div className="font-body font-semibold">
                    <span className="mr-2 font-normal uppercase text-muted-foreground md:hidden">
                      Total:
                    </span>
                    {order.attributes.display_total}
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/account/orders/${order.attributes.number}`
                        )
                      }
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "flex h-9 min-w-[36px] cursor-pointer items-center justify-center rounded-lg border px-3 font-body text-sm transition-colors",
                        page === currentPage
                          ? "border-brand bg-brand font-semibold text-white"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Account;

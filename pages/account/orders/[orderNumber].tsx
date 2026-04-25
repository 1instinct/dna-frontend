import React from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@lib/utils";
import { Layout } from "../../../components/Layout";
import { Loading } from "../../../components/Loading";
import { Button } from "@components/ui";
import { useOrder } from "../../../hooks";

const statusStyles: Record<string, string> = {
  complete: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  processing: "bg-amber-100 text-amber-800",
  canceled: "bg-red-100 text-red-800"
};

const getStatusClass = (status: string) =>
  statusStyles[status] || "bg-muted text-muted-foreground";

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
        <div className="section-container py-10">
          <Button
            variant="outline"
            onClick={() => router.push("/account/orders")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <div className="flex flex-col items-center justify-center rounded-xl bg-card px-5 py-20 text-center">
            <h3 className="mb-3 font-title text-lg text-foreground">
              Order not found
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              We couldn't find this order. Please check the order number and try
              again.
            </p>
          </div>
        </div>
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

  const renderAddress = (address: any, title: string) => (
    <div className="mb-5 last:mb-0">
      <h4 className="mb-2 font-title text-sm font-semibold text-foreground">
        {title}
      </h4>
      <div className="space-y-0.5 font-body text-sm leading-relaxed text-muted-foreground">
        <p>
          {address.attributes.firstname} {address.attributes.lastname}
        </p>
        <p>{address.attributes.address1}</p>
        {address.attributes.address2 && <p>{address.attributes.address2}</p>}
        <p>
          {address.attributes.city}, {address.attributes.state_name}{" "}
          {address.attributes.zipcode}
        </p>
        <p>{address.attributes.phone}</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="section-container py-10">
        <Button
          variant="outline"
          onClick={() => router.push("/account/orders")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <h1 className="mb-1 font-title text-3xl font-bold uppercase tracking-wider text-foreground">
          Order Details
        </h1>
        <p className="mb-8 font-mono text-lg text-muted-foreground">
          Order #{order.attributes.number}
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Line Items */}
            <div className="rounded-xl border border-border/30 bg-card p-6 shadow-sm">
              <h2 className="mb-5 border-b border-border/30 pb-4 font-title text-base font-semibold uppercase tracking-wider text-foreground">
                Order Items ({order.attributes.item_count})
              </h2>
              <div className="divide-y divide-border/20">
                {lineItems.map((item: any) => {
                  const variant = variants.find(
                    (v: any) => v.id === item.relationships.variant.data.id
                  );
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <img
                        src="/placeholder.png"
                        alt={item.attributes.name}
                        className="h-20 w-20 rounded-lg bg-muted object-cover"
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="font-title text-sm font-semibold text-foreground">
                          {item.attributes.name}
                        </span>
                        <span className="font-body text-xs text-muted-foreground">
                          Quantity: {item.attributes.quantity}
                        </span>
                        {variant && (
                          <span className="font-mono text-xs text-muted-foreground">
                            SKU: {variant.attributes.sku}
                          </span>
                        )}
                      </div>
                      <span className="font-title text-sm font-semibold text-foreground">
                        {item.attributes.display_total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Addresses */}
            {shippingAddress && (
              <div className="rounded-xl border border-border/30 bg-card p-6 shadow-sm">
                <h2 className="mb-5 border-b border-border/30 pb-4 font-title text-base font-semibold uppercase tracking-wider text-foreground">
                  Shipping & Billing
                </h2>
                {renderAddress(shippingAddress, "Shipping Address")}
                {billingAddress &&
                  renderAddress(billingAddress, "Billing Address")}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-xl border border-border/30 bg-card p-6 shadow-sm">
              <h2 className="mb-5 border-b border-border/30 pb-4 font-title text-base font-semibold uppercase tracking-wider text-foreground">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">
                    Status
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold uppercase",
                      getStatusClass(order.attributes.state)
                    )}
                  >
                    {order.attributes.state}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-muted-foreground">
                    Order Date
                  </span>
                  <span className="font-body text-sm font-semibold text-foreground">
                    {formatDate(order.attributes.created_at)}
                  </span>
                </div>
                {order.attributes.completed_at && (
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-muted-foreground">
                      Completed
                    </span>
                    <span className="font-body text-sm font-semibold text-foreground">
                      {formatDate(order.attributes.completed_at)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-body text-sm text-muted-foreground">
                    Email
                  </span>
                  <span className="font-body text-sm font-semibold text-foreground">
                    {order.attributes.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Total */}
            <div className="rounded-xl border border-border/30 bg-card p-6 shadow-sm">
              <h2 className="mb-5 border-b border-border/30 pb-4 font-title text-base font-semibold uppercase tracking-wider text-foreground">
                Order Total
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-body text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-body text-sm font-semibold text-foreground">
                    {order.attributes.display_item_total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-muted-foreground">
                    Shipping
                  </span>
                  <span className="font-body text-sm font-semibold text-foreground">
                    {order.attributes.display_ship_total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-muted-foreground">
                    Tax
                  </span>
                  <span className="font-body text-sm font-semibold text-foreground">
                    {order.attributes.display_tax_total}
                  </span>
                </div>
                {order.attributes.promo_total && (
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-muted-foreground">
                      Discount
                    </span>
                    <span className="font-body text-sm font-semibold text-green-600">
                      {order.attributes.display_promo_total}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-border/30 pt-4 font-title text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>{order.attributes.display_total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetail;

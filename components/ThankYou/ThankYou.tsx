import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Layout } from "../Layout";
import { useOrder } from "../../hooks";
import { useAuth } from "../../config/auth";
import { Button } from "@components/ui";

export const ThankYou = () => {
  const router = useRouter();
  const { order: orderNumber, token: orderToken } = router.query;
  const { user } = useAuth();
  const { data: orderData, isLoading } = useOrder(
    orderNumber as string,
    orderToken as string
  );

  useEffect(() => {
    if (orderNumber) {
      console.log("Order completed:", orderNumber);
    }
  }, [orderNumber]);

  const order = orderData?.data;

  return (
    <Layout>
      <div className="mx-auto mt-20 max-w-[800px] px-5 py-10 text-center">
        <div className="mb-5 text-[80px] text-green-DEFAULT">✓</div>
        <h1 className="mb-5 font-title text-title-lg">
          Thank You for Your Order!
        </h1>
        <p className="mb-8 font-body text-body-lg text-gray-DEFAULT">
          Your order has been successfully placed and is being processed.
        </p>

        {orderNumber && (
          <div className="my-8 rounded-lg bg-muted p-5">
            <div className="mb-2 text-sm uppercase tracking-widest text-muted-foreground">
              Order Number
            </div>
            <div className="font-mono text-2xl font-bold">{orderNumber}</div>
          </div>
        )}

        {!isLoading && order && (
          <div className="my-8 rounded-lg bg-card p-8 text-left shadow-md">
            <h3 className="mb-4 font-title text-title-sm">Order Summary</h3>
            <p className="mb-2.5 font-body leading-relaxed text-foreground">
              <strong>Email:</strong> {order.attributes.email}
            </p>
            <p className="mb-2.5 font-body leading-relaxed text-foreground">
              <strong>Total:</strong> {order.attributes.display_total}
            </p>
            <p className="mb-2.5 font-body leading-relaxed text-foreground">
              <strong>Items:</strong> {order.attributes.item_count}
            </p>
          </div>
        )}

        <div className="my-8 rounded-lg bg-card p-8 text-left shadow-md">
          <h3 className="mb-4 font-title text-title-sm">What happens next?</h3>
          <p className="mb-2.5 font-body leading-relaxed text-foreground">
            You'll receive an email confirmation shortly with your order details
            and tracking information.
          </p>
          <p className="mb-2.5 font-body leading-relaxed text-foreground">
            We'll notify you when your order ships, typically within 1-2
            business days.
          </p>
          <p className="mb-2.5 font-body leading-relaxed text-foreground">
            Track your shipment using the tracking number in your confirmation
            email.
          </p>
        </div>

        <div className="my-8 rounded-lg bg-card p-8 text-left shadow-md">
          <h3 className="mb-4 font-title text-title-sm">Need Help?</h3>
          <p className="mb-2.5 font-body leading-relaxed text-foreground">
            If you have any questions about your order, please don't hesitate to
            contact our customer support team.
          </p>
          <p className="mb-2.5 font-body leading-relaxed text-foreground">
            Email: {process.env.NEXT_PUBLIC_EMAIL || "hello@instinct.is"}
          </p>
          <p className="mb-2.5 font-body leading-relaxed text-foreground">
            Phone: {process.env.NEXT_PUBLIC_COMPANY_PHONE || "1-800-000-0000"}
          </p>
        </div>

        <div className="mt-10 flex justify-center gap-5 max-sm:flex-col max-sm:items-stretch">
          <Button onClick={() => router.push("/")}>Continue Shopping</Button>
          {user ? (
            <Button
              variant="outline"
              onClick={() => router.push("/account/orders")}
            >
              View Order History
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => router.push(`/account/orders/${orderNumber}`)}
            >
              View Order Details
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

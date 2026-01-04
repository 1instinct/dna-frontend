import { useQuery } from "react-query";
import { spreeClient } from "../../config/spree";
import { QueryKeys } from "../queryKeys";
import constants from "../../utilities/constants";

// Fetch a single order by number (for guest checkout)
export const fetchOrder = async (orderNumber: string, orderToken?: string) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();

  // For authenticated users
  if (token?.access_token) {
    const response = await spreeClient.account.completedOrder(
      { bearerToken: token.access_token },
      orderNumber
    );
    if (response.isSuccess()) {
      return response.success();
    } else {
      throw new Error(response.fail().message || "Failed to fetch order");
    }
  }

  // For guest users (requires order token)
  if (orderToken) {
    const response = await spreeClient.order.status(
      { orderToken },
      orderNumber
    );
    if (response.isSuccess()) {
      return response.success();
    } else {
      throw new Error(response.fail().message || "Failed to fetch order");
    }
  }

  throw new Error("No authentication token or order token provided");
};

// Fetch all orders for authenticated user
export const fetchOrders = async (page: number = 1) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();

  if (!token?.access_token) {
    throw new Error("User not authenticated");
  }

  const response = await spreeClient.account.completedOrdersList(
    { bearerToken: token.access_token },
    {
      page,
      per_page: 20,
      include: "line_items,variants,billing_address,shipping_address"
    }
  );

  if (response.isSuccess()) {
    constants.IS_DEBUG && console.log("Orders fetched:", response.success());
    return response.success();
  } else {
    throw new Error(response.fail().message || "Failed to fetch orders");
  }
};

// React Query hook for single order
export const useOrder = (orderNumber: string, orderToken?: string) => {
  return useQuery(
    [QueryKeys.ORDER, orderNumber],
    () => fetchOrder(orderNumber, orderToken),
    {
      enabled: !!orderNumber,
      retry: 1
    }
  );
};

// React Query hook for order list
export const useOrders = (page: number = 1) => {
  return useQuery([QueryKeys.ORDERS, page], () => fetchOrders(page), {
    retry: 1,
    staleTime: 30000 // 30 seconds
  });
};

import { useMutation, useQuery, useQueryClient } from "react-query";
import { spreeClient } from "@config/spree";
import { QueryKeys } from "@hooks/queryKeys";
import constants from "@utilities/constants";
import { IOrderResult } from "@spree/storefront-api-v2-sdk/types/interfaces/Order";

interface CheckoutAddress {
  firstname: string;
  lastname: string;
  address1: string;
  address2?: string;
  city: string;
  phone: string;
  zipcode: string;
  state_name: string;
  country_iso: string;
}

interface CheckoutData {
  order: {
    email?: string;
    bill_address_attributes?: CheckoutAddress;
    ship_address_attributes?: CheckoutAddress;
    shipments_attributes?: Array<{
      selected_shipping_rate_id: string;
      id: string;
    }>;
    payments_attributes?: Array<{
      payment_method_id: string;
      source_attributes?: {
        gateway_payment_profile_id?: string;
        cc_type?: string;
        last_digits?: string;
        month?: string;
        year?: string;
        name?: string;
      };
    }>;
  };
}

interface EstimateShippingParams {
  country_iso: string;
  state_name?: string;
  city?: string;
  zipcode?: string;
}

export const getOrderToken = async () => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();

  // Return bearer token for authenticated users, otherwise guest/order token
  if (token?.access_token) {
    return { bearerToken: token.access_token };
  }

  const orderToken =
    (await storage.getOrderToken()) || (await storage.getGuestOrderToken());
  return { orderToken };
};

// Update checkout to next state (address -> delivery -> payment -> confirm -> complete)
export const updateCheckout = async (data: CheckoutData) => {
  const tokens = await getOrderToken();
  if (!tokens) {
    throw new Error("No order token available");
  }

  const response = await spreeClient.checkout.orderUpdate(tokens, data);

  if (response.isSuccess()) {
    constants.IS_DEBUG && console.log("Checkout updated:", response.success());
    return response.success();
  } else {
    constants.IS_DEBUG &&
      console.error("Checkout update failed:", response.fail());
    throw new Error(response.fail().message || "Checkout update failed");
  }
};

// Advance checkout to next step
export const advanceCheckout = async () => {
  const tokens = await getOrderToken();
  if (!tokens) {
    throw new Error("No order token available");
  }

  const response = await spreeClient.checkout.orderNext(tokens);

  if (response.isSuccess()) {
    constants.IS_DEBUG && console.log("Checkout advanced:", response.success());
    return response.success();
  } else {
    constants.IS_DEBUG &&
      console.error("Checkout advance failed:", response.fail());
    throw new Error(response.fail().message || "Failed to advance checkout");
  }
};

// Complete the checkout
export const completeCheckout = async () => {
  const tokens = await getOrderToken();
  if (!tokens) {
    throw new Error("No order token available");
  }

  const response = await spreeClient.checkout.complete(tokens);

  if (response.isSuccess()) {
    constants.IS_DEBUG &&
      console.log("Checkout completed:", response.success());
    // Clear the cart token after successful purchase
    const storage = (await import("../../config/storage")).default;
    storage.clearToken();
    return response.success();
  } else {
    constants.IS_DEBUG &&
      console.error("Checkout completion failed:", response.fail());
    throw new Error(response.fail().message || "Failed to complete checkout");
  }
};

// Get available shipping methods
export const getShippingMethods = async () => {
  const tokens = await getOrderToken();
  if (!tokens) {
    throw new Error("No order token available");
  }

  const response = await spreeClient.checkout.shippingMethods(tokens);

  if (response.isSuccess()) {
    constants.IS_DEBUG && console.log("Shipping methods:", response.success());
    return response.success();
  } else {
    throw new Error(
      response.fail().message || "Failed to get shipping methods"
    );
  }
};

// Get available payment methods
export const getPaymentMethods = async () => {
  const tokens = await getOrderToken();
  if (!tokens) {
    throw new Error("No order token available");
  }

  const response = await spreeClient.checkout.paymentMethods(tokens);

  if (response.isSuccess()) {
    constants.IS_DEBUG && console.log("Payment methods:", response.success());
    return response.success();
  } else {
    throw new Error(response.fail().message || "Failed to get payment methods");
  }
};

// Estimate shipping methods from cart
export const estimateShipping = async (params: EstimateShippingParams) => {
  const tokens = await getOrderToken();
  if (!tokens) {
    throw new Error("No order token available");
  }

  const response = await spreeClient.cart.estimateShippingMethods(
    tokens,
    params
  );

  if (response.isSuccess()) {
    constants.IS_DEBUG &&
      console.log("Estimated shipping:", response.success());
    return response.success();
  } else {
    throw new Error(response.fail().message || "Failed to estimate shipping");
  }
};

// Apply coupon code
export const applyCoupon = async (couponCode: string) => {
  const tokens = await getOrderToken();
  if (!tokens) {
    throw new Error("No order token available");
  }

  const response = await spreeClient.cart.applyCouponCode(tokens, {
    coupon_code: couponCode
  });

  if (response.isSuccess()) {
    constants.IS_DEBUG && console.log("Coupon applied:", response.success());
    return response.success();
  } else {
    throw new Error(response.fail().message || "Failed to apply coupon");
  }
};

// Remove coupon code
export const removeCoupon = async (couponCode?: string) => {
  const tokens = await getOrderToken();
  if (!tokens) {
    throw new Error("No order token available");
  }

  const response = await spreeClient.cart.removeCouponCode(tokens, couponCode);

  if (response.isSuccess()) {
    constants.IS_DEBUG && console.log("Coupon removed:", response.success());
    return response.success();
  } else {
    throw new Error(response.fail().message || "Failed to remove coupon");
  }
};

// React Query hooks
export const useUpdateCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation(updateCheckout, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
    }
  });
};

export const useAdvanceCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation(advanceCheckout, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
    }
  });
};

export const useCompleteCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation(completeCheckout, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
    }
  });
};

export const useShippingMethods = () => {
  return useQuery([QueryKeys.CART, "shipping-methods"], getShippingMethods);
};

export const usePaymentMethods = () => {
  return useQuery([QueryKeys.CART, "payment-methods"], getPaymentMethods);
};

export const useEstimateShipping = () => {
  return useMutation(estimateShipping);
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation(applyCoupon, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
    }
  });
};

export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation(removeCoupon, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
    }
  });
};

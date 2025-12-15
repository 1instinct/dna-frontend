import { AddItem } from "@spree/storefront-api-v2-sdk/types/interfaces/endpoints/CartClass";
import { IOrder } from "@spree/storefront-api-v2-sdk/types/interfaces/Order";
import { useQuery } from "react-query";
import { spreeClient } from "@config/spree";
import { QueryKeys } from "@hooks/queryKeys";
import constants from "@utilities/constants";

export const showCart = async () => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  
  if (token) {
    try {
      const getCart = await spreeClient.cart.show({
        bearerToken: token.access_token
      });
      if (getCart.isSuccess()) {
        constants.IS_DEBUG && console.log("HAS USER CART");
        return getCart.success();
      } else {
        // Cart doesn't exist, create a new one
        constants.IS_DEBUG && console.log("Creating new user cart");
        const newCart = await spreeClient.cart.create({
          bearerToken: token.access_token
        });
        if (newCart.isSuccess()) {
          constants.IS_DEBUG && console.log("new cart: ", newCart.success());
          return newCart.success();
        } else {
          throw new Error(newCart.fail().message);
        }
      }
    } catch (error) {
      // If cart.show fails, create a new cart
      constants.IS_DEBUG && console.log("Cart fetch failed, creating new cart");
      const newCart = await spreeClient.cart.create({
        bearerToken: token.access_token
      });
      if (newCart.isSuccess()) {
        return newCart.success();
      } else {
        throw new Error(newCart.fail().message);
      }
    }
  } else {
    const guestOrderToken = await storage.getGuestOrderToken();
    if (guestOrderToken) {
      try {
        const response = await spreeClient.cart.show({
          orderToken: guestOrderToken as string
        });
        if (response.isSuccess()) {
          constants.IS_DEBUG && console.log("guest cart: ", response.success());
          return response.success();
        } else {
          // Guest cart doesn't exist, create new one
          constants.IS_DEBUG && console.log("Creating new guest cart");
          const newResponse = await spreeClient.cart.create();
          if (newResponse.isSuccess()) {
            const result = newResponse.success();
            storage.setGuestOrderToken(result.data.attributes.token);
            return result;
          } else {
            throw new Error(newResponse.fail().message);
          }
        }
      } catch (error) {
        // If cart.show fails, create a new cart
        constants.IS_DEBUG && console.log("Guest cart fetch failed, creating new cart");
        const response = await spreeClient.cart.create();
        if (response.isSuccess()) {
          const result = response.success();
          storage.setGuestOrderToken(result.data.attributes.token);
          return result;
        } else {
          throw new Error(response.fail().message);
        }
      }
    } else {
      // No guest token, create new cart
      const response = await spreeClient.cart.create();
      if (response.isSuccess()) {
        constants.IS_DEBUG &&
          console.log("creating cart: ", response.success());
        const result = response.success();
        storage.setGuestOrderToken(result.data.attributes.token);
        return result;
      } else {
        throw new Error(response.fail().message);
      }
    }
  }
};

export const addItemToCart = async (item: AddItem) => {
  const storage = (await import("../../config/storage")).default;
  let orderToken = await storage.getOrderToken();

  constants.IS_DEBUG && console.log("ORDER TOKEN: ", orderToken);

  // If no user order token, try creating user order token, otherwise check for or create a guest order token
  if (!orderToken) {
    constants.IS_DEBUG && console.log("NO USER ORDER TOKEN");

    orderToken = await storage.getGuestOrderToken();

    // No guest order token, create new cart and store new token
    if (!orderToken) {
      const newCart = await spreeClient.cart.create();
      if (newCart.isSuccess()) {
        orderToken = newCart.success().data.attributes.token;
        storage.setGuestOrderToken(orderToken);
        constants.IS_DEBUG && console.log("ORDER TOKEN CREATED: ", orderToken);
      } else {
        throw new Error("Failed to create new cart: " + newCart.fail().message);
      }
    }
  }

  // Add item to cart using the existing or new order token
  const response = await spreeClient.cart.addItem(
    { orderToken: orderToken },
    {
      variant_id: item.variant_id,
      quantity: item.quantity
    }
  );

  if (response.isSuccess()) {
    constants.IS_DEBUG && console.log("ADD ITEM SUCCESSFUL");
    return response.success();
  } else {
    constants.IS_DEBUG && console.log("ADD ITEM FAILED");
    throw new Error(response.fail().message);
  }
};

export const useCart = () => {
  return useQuery<IOrder, Error>([QueryKeys.CART], showCart, {
    onError: (error) => {
      console.error("Failed to fetch cart:", error.message);
    },
    onSuccess: (data) => {
      constants.IS_DEBUG && console.log("Cart fetched successfully:", data);
    }
  });
};

import { AddItem } from "@spree/storefront-api-v2-sdk/types/interfaces/endpoints/CartClass";
import { IOrder } from "@spree/storefront-api-v2-sdk/types/interfaces/Order";
import { useQuery } from "react-query";
import { spreeClient } from "../../config/spree";
import { QueryKeys } from "../queryKeys";
import constants from "../../utilities/constants";

export const showCart = async () => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  if (token) {
    const getCart = await spreeClient.cart.show(
      { bearerToken: token.access_token },
      {
        include: "line_items"
      }
    );
    if (getCart.isSuccess()) {
      console.log("HAS USER CART");
      return getCart.success();
    } else {
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
  } else {
    const guestOrderToken = await storage.getGuestOrderToken();
    if (guestOrderToken) {
      const response = await spreeClient.cart.show({
        orderToken: guestOrderToken as string
      });
      if (response.isSuccess()) {
        constants.IS_DEBUG && console.log("guest cart: ", response.success());
        return response.success();
      } else {
        throw new Error(response.fail().message);
      }
    } else {
      const response = await spreeClient.cart.create();
      if (response.isSuccess()) {
        constants.IS_DEBUG && console.log("creating cart: ", response.success());
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

  // If no user order token, check for or create a guest order token
  if (!orderToken) {
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
    { orderToken: orderToken},
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
  return useQuery<IOrder, false>([QueryKeys.CART], () => showCart());
};

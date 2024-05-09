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
      return getCart.success();
    } else {
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
      const response = await spreeClient.cart.show({
        orderToken: guestOrderToken as any
      });
      if (response.isSuccess()) {
        constants.IS_DEBUG && console.log("cart: ", response.success());
        return response.success();
      } else {
        throw new Error(response.fail().message);
      }
    } else {
      const response = await spreeClient.cart.create();
      if (response.isSuccess()) {
        constants.IS_DEBUG && console.log("cart: ", response.success());
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
  const orderToken = await storage.getToken();
  if (!orderToken) {
    const guestOrderToken = await storage.getGuestOrderToken();

    if (guestOrderToken) {
      const response = await spreeClient.cart.addItem(
        { orderToken: guestOrderToken as any },
        {
          variant_id: item.variant_id,
          quantity: item.quantity
        }
      );
      if (response.isSuccess()) {
        const result = response.success();
        return response.success();
      } else {
        throw new Error(response.fail().message);
      }
    }

    const response = await spreeClient.cart.create();

    if (response.isSuccess()) {
      const result = response.success();
      const tokenString = result.data.attributes.token;
      storage.setGuestOrderToken(tokenString as string);
      const newToken = await storage.getGuestOrderToken();
      if (newToken) {
        const addResponse = await spreeClient.cart.addItem(newToken, {
          variant_id: item.variant_id,
          quantity: item.quantity
        });
        if (addResponse.isSuccess()) {
          return addResponse.success();
        } else {
          throw new Error(addResponse.fail().message);
        }
      }
    } else {
      throw new Error(response.fail().message);
    }
    throw new Error("NO CART TOKENS FOUND, COULD NOT ADD ITEM");
  }
  const response = await spreeClient.cart.addItem(
    { bearerToken: orderToken.access_token },
    item
  );
  if (response.isSuccess()) {
    return response.success();
  } else {
    throw new Error(response.fail().message);
  }
};

export const useCart = () => {
  return useQuery<IOrder, false>([QueryKeys.CART], () => showCart());
};

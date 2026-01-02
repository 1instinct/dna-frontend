import { initReactQueryAuth } from "react-query-auth";
import { IAccount } from "@spree/storefront-api-v2-sdk/types/interfaces/Account";
import { spreeClient } from "@config/spree";
import constants from "@utilities/constants";

interface LoginUser {
  username: string;
  password: string;
}

interface SpreeUser {
  user: {
    email: string;
    password: string;
    password_confirmation: string;
  };
}

async function mergeCarts(guestOrderToken: string) {
  const storage = (await import("./storage")).default;
  constants.IS_DEBUG && console.log("Starting mergeCarts function...");

  const userToken = await storage.getToken(); // Retrieve the new user token
  constants.IS_DEBUG && console.log("User token retrieved:", userToken);

  // Fetch guest cart details
  constants.IS_DEBUG &&
    console.log("Fetching guest cart with token:", guestOrderToken);
  const guestCartResponse = await spreeClient.cart.show({
    orderToken: guestOrderToken
  });
  if (!guestCartResponse.isSuccess()) {
    console.error("Failed to retrieve guest cart:", guestCartResponse.fail());
    return;
  }
  constants.IS_DEBUG &&
    console.log(
      "Guest cart retrieved successfully:",
      guestCartResponse.success()
    );
  const guestCart = guestCartResponse.success();

  // Fetch user's current cart or create a new one if none exists
  constants.IS_DEBUG && console.log("Fetching user's cart...");
  const userCartResponse = await spreeClient.cart.show({
    bearerToken: userToken?.access_token
  });
  if (!userCartResponse.isSuccess()) {
    constants.IS_DEBUG &&
      console.warn(
        "No user cart found or an error occurred, creating a new cart"
      );
    const newCartResponse = await spreeClient.cart.create({
      bearerToken: userToken?.access_token
    });
    if (!newCartResponse.isSuccess()) {
      console.error("Failed to create new cart:", newCartResponse.fail());
      return;
    }
    constants.IS_DEBUG &&
      console.log(
        "New user cart created successfully:",
        newCartResponse.success()
      );
  } else {
    constants.IS_DEBUG &&
      console.log(
        "User cart retrieved successfully:",
        userCartResponse.success()
      );
  }

  // Iterate through guest cart items and add them to the user's cart
  constants.IS_DEBUG &&
    console.log("Merging items from guest cart to user cart...");
  const lineItems = Array.isArray(guestCart.data.relationships.line_items.data)
    ? guestCart.data.relationships.line_items.data
    : [guestCart.data.relationships.line_items.data];
  for (const item of lineItems) {
    // Find the full line item object in guestCart.included to get the quantity
    const fullLineItem = Array.isArray(guestCart.included)
      ? guestCart.included.find(
          (includedItem) =>
            includedItem.type === "line_item" && includedItem.id === item.id
        )
      : undefined;
    const quantity =
      fullLineItem &&
      fullLineItem.attributes &&
      typeof fullLineItem.attributes.quantity === "number"
        ? fullLineItem.attributes.quantity
        : 1;
    constants.IS_DEBUG &&
      console.log(
        `Adding item to user cart: ${item.id} with quantity: ${quantity}`
      );
    try {
      const addItemResponse = await spreeClient.cart.addItem(
        { bearerToken: userToken?.access_token },
        {
          variant_id: item.id,
          quantity: quantity
        }
      );
      if (!addItemResponse.isSuccess()) {
        const error = addItemResponse.fail();
        console.warn(
          `Failed to add item ${item.id} to cart (may already exist):`,
          error.message || error
        );
        // Continue with other items instead of failing completely
      } else {
        constants.IS_DEBUG &&
          console.log("Item added successfully:", addItemResponse.success());
      }
    } catch (error) {
      console.warn(`Exception adding item ${item.id} to cart:`, error);
      // Continue with other items
    }
  }

  constants.IS_DEBUG && console.log("Clearing guest order token...");
  storage.clearGuestToken();
  constants.IS_DEBUG && console.log("Guest order token cleared.");
}

const authConfig = {
  loadUser: async () => {
    const storage = (await import("./storage")).default;
    const token = await storage.getToken();
    const guestOrderToken = await storage.getGuestOrderToken();
    constants.IS_DEBUG && console.warn("TOKEN: ", token);
    constants.IS_DEBUG && console.warn("GUEST ORDER TOKEN: ", guestOrderToken);
    if (token?.access_token && token?.token_type === "Bearer") {
      const response = await spreeClient.account.accountInfo({
        bearerToken: token.access_token
      });
      if (response.isSuccess()) {
        constants.IS_DEBUG && console.warn("USER LOADED: ", response.success());
        return response.success();
      }
      constants.IS_DEBUG && console.warn(response.fail());
      return null;
    }
    return null;
  },
  loginFn: async (data: unknown) => {
    const storage = (await import("./storage")).default;
    const guestOrderToken = await storage.getGuestOrderToken(); // Retrieve guest cart token if it exists

    const response = await spreeClient.authentication.getToken(
      data as LoginUser
    );
    if (response.isSuccess()) {
      const result = response.success();
      storage.setToken(result); // Save the authenticated user's token
      const user = await authConfig.loadUser();

      if (guestOrderToken) {
        try {
          await mergeCarts(guestOrderToken); // Merge guest cart into the user's cart
          // Guest tokens already cleared in mergeCarts
        } catch (mergeError) {
          console.error("Cart merge failed, but login succeeded:", mergeError);
          // Don't throw - login was successful even if cart merge failed
          storage.clearGuestToken(); // Clear guest tokens only
        }
      }

      return user;
    } else {
      const error = response.fail();
      constants.IS_DEBUG && console.warn(error);
      // Throw error so it can be caught in the Login component
      throw new Error(
        error.message || "Invalid email or password. Please try again."
      );
    }
  },
  registerFn: async (data: unknown) => {
    const response = await spreeClient.account.create(data as SpreeUser);
    if (response.isSuccess()) {
      constants.IS_DEBUG &&
        console.warn("REGISTER SUCCESS: ", response.success());
      // register does not receive a token
      // so we can decide to either run the login automatically or ask the user to login
      // also this is where there should be some notification about confirming their email

      return response.success();
    } else {
      constants.IS_DEBUG && console.warn(response.fail());
      return null;
    }
  },
  logoutFn: async () => {
    const storage = (await import("./storage")).default;
    storage.clearToken();
  }
};

export const { AuthProvider, useAuth } = initReactQueryAuth<
  IAccount | null,
  string
>(authConfig);

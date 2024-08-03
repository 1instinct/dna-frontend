// src/lib/auth.ts

import { initReactQueryAuth } from "react-query-auth";
import { IAccount } from "@spree/storefront-api-v2-sdk/types/interfaces/Account";
import { spreeClient } from "@config/spree";
import { RelationType } from "@spree/storefront-api-v2-sdk/types/interfaces/Relationships";
import { sleep } from "react-query/types/core/utils";

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
  const userToken = await storage.getToken(); // Retrieve the new user token

  // Fetch guest cart details
  const guestCartResponse = await spreeClient.cart.show({ orderToken: guestOrderToken });
  if (guestCartResponse.isSuccess()) {
    const guestCart = guestCartResponse.success();
    console.warn("SLEEP 5s, GUEST CART: ", guestCart);
    sleep(5000);
    const userCart = await spreeClient.cart.show({ bearerToken: userToken?.access_token });
    
    if (!userCart.isSuccess()) {
      const newCart = await spreeClient.cart.create({ bearerToken: userToken?.access_token });
      if (newCart.isSuccess()) {
        console.warn("NEW CART CREATED: ", newCart.success());
      } else {
        console.error("Failed to create new cart: ", newCart.fail());
        return;
      }
    }
    // Iterate through guest cart items and add them to the user's cart
    const lineItems = guestCart.data.relationships.line_items.data;
    for (const item of lineItems as RelationType[]) {
      await spreeClient.cart.addItem(
        { bearerToken: userToken?.access_token },
        {
          variant_id: item.id,
          quantity: 1
        }
      );
    }
  } else {
    console.error("Failed to retrieve guest cart: ", guestCartResponse.fail());
  }
}

const authConfig = {
  loadUser: async () => {
    const storage = (await import("./storage")).default;
    const token = await storage.getToken();
    const guestOrderToken = await storage.getGuestOrderToken();
    console.warn("TOKEN: ", token);
    console.warn("GUEST ORDER TOKEN: ", guestOrderToken);
    if (token?.access_token && token?.token_type === "Bearer") {
      const response = await spreeClient.account.accountInfo({
        bearerToken: token.access_token
      });
      if (response.isSuccess()) {
        console.warn("USER LOADED: ", response.success());
        return response.success();
      }
      console.warn(response.fail());
      return null;
    }
    return null;
  },
  loginFn: async (data: unknown) => {
    const storage = (await import("./storage")).default;
    const guestOrderToken = await storage.getGuestOrderToken(); // Retrieve guest cart token if it exists

    const response = await spreeClient.authentication.getToken(data as LoginUser);
    if (response.isSuccess()) {
      const result = response.success();
      storage.setToken(result);  // Save the authenticated user's token
      const user = await authConfig.loadUser();

      if (guestOrderToken) {
        await mergeCarts(guestOrderToken); // Merge guest cart into the user's cart
        // Clear the guest order token after merging
        storage.clearToken("guestOrderToken");
      }

      return user;
    } else {
      console.warn(response.fail());
      return null;
    }
  },
  registerFn: async (data: unknown) => {
    const response = await spreeClient.account.create(data as SpreeUser);
    if (response.isSuccess()) {
      console.warn("REGISTER SUCCESS: ", response.success());
      // register does not receive a token
      // so we can decide to either run the login automatically or ask the user to login
      // also this is where there should be some notification about confirming their email

      return response.success();
    } else {
      console.warn(response.fail());
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

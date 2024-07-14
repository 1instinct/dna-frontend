// src/lib/auth.ts

import { initReactQueryAuth } from "react-query-auth";
import { IAccount } from "@spree/storefront-api-v2-sdk/types/interfaces/Account";
import { spreeClient } from "./spree";

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
    const response = await spreeClient.authentication.getToken(
      data as LoginUser
    );
    if (response.isSuccess()) {
      const result = response.success();
      const storage = (await import("./storage")).default;
      storage.setToken(result);
      const user = await authConfig.loadUser();
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

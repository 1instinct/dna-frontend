import {
  IOAuthToken,
  IToken
} from "@spree/storefront-api-v2-sdk/types/interfaces/Token";
import { spreeClient } from "./spree";
import constants from "../utilities/constants";

const storage = {
  getToken: async (): Promise<IOAuthToken | undefined> => {
    const token = window.localStorage.getItem("token");
    if (token) {
      const parsedToken: IOAuthToken = JSON.parse(token);
      const expiresAt = parsedToken.created_at + parsedToken.expires_in;
      const now = Math.round(Date.now() / 1000);
      const tokenExpired = now - expiresAt > 0;
      if (tokenExpired) {
        const response = await spreeClient.authentication.refreshToken({
          refresh_token: parsedToken.refresh_token
        });
        if (response.isSuccess()) {
          const newToken = response.success();
          storage.setToken(newToken);
          return newToken;
        } else {
          constants.IS_DEBUG && console.warn("COULD NOT REFRESH TOKEN");
          storage.clearToken();
        }
      }
      return JSON.parse(token);
    }
  },
  isTokenExpired: (token: IOAuthToken): boolean => {
    const expiresAt = token.created_at + token.expires_in;
    const now = Math.round(Date.now() / 1000);
    return now >= expiresAt;
  },
  refreshToken: async (token: IOAuthToken): Promise<IOAuthToken | undefined> => {
    const response = await spreeClient.authentication.refreshToken({
      refresh_token: token.refresh_token
    });
    if (response.isSuccess()) {
      const newToken = response.success();
      storage.setToken(newToken);
      return newToken;
    } else {
      constants.IS_DEBUG && console.warn("Failed to refresh token");
      storage.clearToken();
      return undefined;
    }
  },
  setToken: (token: IOAuthToken) =>
    window.localStorage.setItem("token", JSON.stringify(token)),
  getGuestOrderToken: async (): Promise<string | undefined> => {
    const token = window.localStorage.getItem("guestOrderToken");
    if (token) {
      return JSON.parse(token);
    }
  },
  setGuestOrderToken: (token: string) => {
    window.localStorage.setItem("guestOrderToken", JSON.stringify(token));
  },
  getOrderToken: async (): Promise<string | undefined> => {
    const token = window.localStorage.getItem("orderToken");
    if (token) {
      return JSON.parse(token);
    }
  },
  setOrderToken: (token: string) => {
    window.localStorage.setItem("orderToken", JSON.stringify(token));
  },
  clearToken: () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("orderToken");
    window.localStorage.removeItem("guestOrderToken");
  },
};

export default storage;

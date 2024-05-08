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
  setToken: (token: IOAuthToken) =>
    window.localStorage.setItem("token", JSON.stringify(token)),
  getGuestOrderToken: (): IToken | undefined => {
    const token = window.localStorage.getItem("guestOrderToken");
    if (token) {
      return JSON.parse(token);
    }
  },
  setGuestOrderToken: (token: string) => {
    window.localStorage.setItem("guestOrderToken", JSON.stringify(token));
  },
  clearToken: () => window.localStorage.removeItem("token")
};

export default storage;

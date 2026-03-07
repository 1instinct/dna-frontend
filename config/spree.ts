import { makeClient } from "@spree/storefront-api-v2-sdk";

// Use same-origin requests (proxied to Spree via Next.js rewrites in next.config.js)
// to avoid CORS issues. NEXT_PUBLIC_SPREE_API_URL is still used for image URLs.
export const spreeClient = makeClient({
  host:
    typeof window !== "undefined"
      ? ""
      : process.env.NEXT_PUBLIC_SPREE_API_URL || "http://localhost:8080"
});

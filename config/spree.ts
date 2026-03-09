import { makeClient } from "@spree/storefront-api-v2-sdk";

// In the browser, use window.location.origin so SDK requests hit the same origin
// and get proxied by Next.js rewrites (next.config.js proxies /api/v1/* and /api/v2/*
// to SPREE_API_URL). On the server, use the direct Spree URL.
// NOTE: host must be truthy — the SDK defaults "" to "http://localhost:3000/".
export const spreeClient = makeClient({
  host:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SPREE_API_URL || "http://localhost:8080"
});

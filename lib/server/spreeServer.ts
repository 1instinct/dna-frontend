// SERVER ONLY. Import this from pages/api/* (or getServerSideProps/getStaticProps)
// and nowhere else. It reads SPREE_ACCESS_TOKEN, which must never reach the
// browser bundle: next.config.js runs dotenv-webpack with systemvars, so any
// `process.env.X` referenced from client code gets inlined at build time.

const SPREE_API_URL =
  process.env.SPREE_API_URL ||
  process.env.NEXT_PUBLIC_SPREE_API_URL ||
  "http://localhost:8080";

if (typeof window !== "undefined") {
  throw new Error("lib/server/spreeServer must not be imported client-side");
}

/**
 * GET a Spree endpoint with the server-held storefront key.
 * Use only for public, read-only data (menus, live streams, store info).
 * Never use it for anything tied to a user: the key resolves to one Spree user.
 */
export const spreeServerGet = async (path: string): Promise<Response> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json;charset=UTF-8",
    Accept: "application/json"
  };
  const token = process.env.SPREE_ACCESS_TOKEN;
  if (token) headers["X-Spree-Token"] = token;

  return fetch(`${SPREE_API_URL}${path}`, { method: "GET", headers });
};

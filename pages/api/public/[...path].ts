import { NextApiRequest, NextApiResponse } from "next";
import { spreeServerGet } from "../../../lib/server/spreeServer";

// Read-only proxy for the public Spree endpoints that need the storefront key.
// The key stays on the server (SPREE_ACCESS_TOKEN); the browser calls
// /api/public/<route> and gets the backend's JSON back unchanged.
//
//   /api/public/menu_items?menu_location_id=N -> /api/v1/menu_items
//   /api/public/menu_locations/N              -> /api/v1/menu_locations/N
//   /api/public/live_stream                   -> /api/v1/live_stream
//   /api/public/live_stream/:id               -> /api/v1/live_stream/:id
//   /api/public/default_store                 -> /api/v2/storefront/default_store
//
// Anything else is a 404. Do not add user-specific endpoints here.

const ID = /^[A-Za-z0-9_-]{1,64}$/;
const NUM = /^\d{1,10}$/;

type Route = { path: string; cache: string };

const CACHE_SHORT = "public, s-maxage=60, stale-while-revalidate=300";
const CACHE_LIVE = "public, s-maxage=10, stale-while-revalidate=30";

const resolveRoute = (
  segments: string[],
  query: NextApiRequest["query"]
): Route | null => {
  const [head, id, ...rest] = segments;
  if (rest.length) return null;

  switch (head) {
    case "menu_items": {
      if (id) return null;
      const loc = query.menu_location_id;
      if (loc === undefined)
        return { path: "/api/v1/menu_items", cache: CACHE_SHORT };
      if (typeof loc !== "string" || !NUM.test(loc)) return null;
      return {
        path: `/api/v1/menu_items?menu_location_id=${loc}`,
        cache: CACHE_SHORT
      };
    }
    case "menu_locations":
      if (!id || !NUM.test(id)) return null;
      return { path: `/api/v1/menu_locations/${id}`, cache: CACHE_SHORT };
    case "live_stream":
      if (!id) return { path: "/api/v1/live_stream", cache: CACHE_LIVE };
      if (!ID.test(id)) return null;
      return {
        path: `/api/v1/live_stream/${encodeURIComponent(id)}`,
        cache: CACHE_LIVE
      };
    case "default_store":
      if (id) return null;
      return { path: "/api/v2/storefront/default_store", cache: CACHE_SHORT };
    default:
      return null;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const raw = req.query.path;
  const segments = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const route = resolveRoute(segments, req.query);
  if (!route) return res.status(404).json({ error: "Not found" });

  try {
    const upstream = await spreeServerGet(route.path);
    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json"
    );
    if (upstream.ok) res.setHeader("Cache-Control", route.cache);
    return res.send(body);
  } catch (err) {
    console.error("[api/public] upstream request failed:", err);
    return res.status(502).json({ error: "Upstream request failed" });
  }
}

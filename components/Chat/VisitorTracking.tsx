import { useEffect } from "react";
import { useRouter } from "next/router";
import { storefrontApi } from "../../lib/chat/api";
import { browserVisitEnv } from "../../lib/chat/browser";
import { VisitTracker } from "../../lib/chat/visits";
import {
  ensureVisitorToken,
  writeVisitorToken
} from "../../lib/chat/visitorToken";

/**
 * Pings dna-admin's POST /api/v1/storefront/visits on the first page, after
 * each route change and every 60 s while the tab is visible, so the admin's
 * Visitors screen shows who is browsing and what is in their cart. Renders
 * nothing; StorefrontChat mounts it behind NEXT_PUBLIC_VISITOR_TRACKING and
 * consent.
 */
export const VisitorTracking = () => {
  const router = useRouter();

  useEffect(() => {
    const tracker = new VisitTracker({
      api: storefrontApi,
      env: browserVisitEnv(),
      getToken: () => ensureVisitorToken(),
      setToken: (token) => writeVisitorToken(token)
    });
    const onRoute = () => tracker.routeChanged();
    tracker.start();
    router.events.on("routeChangeComplete", onRoute);
    return () => {
      router.events.off("routeChangeComplete", onRoute);
      tracker.stop();
    };
    // router.events is a stable emitter; one tracker per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default VisitorTracking;

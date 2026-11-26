import { useAuth } from "../../config/auth";

/**
 * True when the signed-in account has the `wholesale` Spree role. The v2
 * account payload carries `is_wholesale` (added by a dna-admin decorator);
 * read it defensively, anything else is retail. `pages/_app.tsx` passes the
 * result to every page as `wholesale`; leaf components such as ProductCard
 * read it here instead of threading a prop through the app.
 */
export const useWholesaleMode = (): boolean => {
  const { user } = useAuth();
  const attributes = user?.data?.attributes as
    | Record<string, unknown>
    | undefined;
  return attributes?.is_wholesale === true;
};

import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAuth } from "@config/auth";
import { QueryKeys } from "@hooks/queryKeys";
import { isApiError, v1 } from "@lib/api/v1";
import { normalizeRefCode } from "@lib/affiliate/ref";
import type {
  Affiliate,
  AffiliateApplyInput,
  AffiliateStats,
  AffiliateUpdateInput,
  CommissionsPage,
  PayoutsResponse
} from "@lib/affiliate/types";

/** Retry network and server failures, never 4xx answers. */
const retry = (count: number, error: unknown) =>
  count < 2 &&
  !(isApiError(error) && error.status >= 400 && error.status < 500);

/**
 * The signed-in user's id. Every affiliate query key carries it, so after a
 * sign-out and a different sign-in nobody sees the previous user's cache.
 */
const useUserId = (): string | null => {
  const { user } = useAuth();
  return user?.data?.id ? String(user.data.id) : null;
};

/** The signed-in user's affiliate account, or null if they haven't applied. */
export const fetchAffiliate = async (): Promise<Affiliate | null> => {
  try {
    return await v1<Affiliate>("/affiliate");
  } catch (e) {
    if (isApiError(e) && e.status === 404) return null;
    throw e;
  }
};

export const useAffiliate = (enabled = true) => {
  const uid = useUserId();
  return useQuery([QueryKeys.AFFILIATE, uid], fetchAffiliate, {
    enabled: enabled && !!uid,
    retry,
    staleTime: 30000
  });
};

export const useAffiliateStats = (
  range: { from: string; to: string },
  enabled = true
) => {
  const uid = useUserId();
  return useQuery(
    [QueryKeys.AFFILIATE_STATS, uid, range.from, range.to],
    () =>
      v1<AffiliateStats>("/affiliate/stats", {
        query: { from: range.from, to: range.to }
      }),
    {
      enabled: enabled && !!uid,
      retry,
      keepPreviousData: true,
      staleTime: 60000
    }
  );
};

export const useAffiliateCommissions = (page: number, enabled = true) => {
  const uid = useUserId();
  return useQuery(
    [QueryKeys.AFFILIATE_COMMISSIONS, uid, page],
    () => v1<CommissionsPage>("/affiliate/commissions", { query: { page } }),
    {
      enabled: enabled && !!uid,
      retry,
      keepPreviousData: true,
      staleTime: 60000
    }
  );
};

export const useAffiliatePayouts = (enabled = true) => {
  const uid = useUserId();
  return useQuery(
    [QueryKeys.AFFILIATE_PAYOUTS, uid],
    () => v1<PayoutsResponse>("/affiliate/payouts"),
    { enabled: enabled && !!uid, retry, staleTime: 60000 }
  );
};

/** Live availability of a code; idle until the code is well-formed. */
export const useAffiliateCodeAvailable = (rawCode: string) => {
  const uid = useUserId();
  const code = normalizeRefCode(rawCode);
  return useQuery(
    [QueryKeys.AFFILIATE_CODE_AVAILABLE, uid, code],
    () =>
      v1<{ available: boolean }>("/affiliate/code_available", {
        query: { code }
      }),
    { enabled: !!code && !!uid, retry: false, staleTime: 60000 }
  );
};

const useInvalidateAffiliate = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries(QueryKeys.AFFILIATE);
    queryClient.invalidateQueries(QueryKeys.AFFILIATE_STATS);
    queryClient.invalidateQueries(QueryKeys.AFFILIATE_COMMISSIONS);
    queryClient.invalidateQueries(QueryKeys.AFFILIATE_PAYOUTS);
  };
};

export const useApplyAffiliate = () => {
  const invalidate = useInvalidateAffiliate();
  return useMutation(
    (input: AffiliateApplyInput) =>
      v1<Affiliate>("/affiliate", { method: "POST", body: input }),
    { onSuccess: invalidate }
  );
};

/** PATCH /affiliate with top-level fields (payout_email, website, …). */
export const useUpdateAffiliate = () => {
  const invalidate = useInvalidateAffiliate();
  return useMutation(
    (input: AffiliateUpdateInput) =>
      v1<Affiliate>("/affiliate", { method: "PATCH", body: input }),
    { onSuccess: invalidate }
  );
};

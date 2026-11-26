import { useMutation, useQuery, useQueryClient } from "react-query";
import { QueryKeys } from "@hooks/queryKeys";
import { ApiError, v1 } from "../../lib/api/v1";
import type {
  CreatorApplication,
  CreatorApplicationInput,
  CreatorProduct,
  CreatorProductInput,
  CreatorSales,
  CreatorSummary,
  Payout
} from "../../lib/creator/types";

const notFoundAsNull = async <T>(p: Promise<T>): Promise<T | null> => {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
};

/** Never retry answers (4xx); retry network and server failures twice. */
const retryTransient = (count: number, e: unknown) =>
  !(e instanceof ApiError && e.status >= 400 && e.status < 500) && count < 2;

// ── Application ────────────────────────────────────────────────

export const useCreatorApplication = (enabled = true) =>
  useQuery<CreatorApplication | null, ApiError>(
    [QueryKeys.CREATOR_APPLICATION],
    () => notFoundAsNull(v1<CreatorApplication>("/creator_application")),
    { enabled, retry: retryTransient, staleTime: 30_000 }
  );

export const useApplyCreator = () => {
  const qc = useQueryClient();
  return useMutation<CreatorApplication, ApiError, CreatorApplicationInput>(
    (body) =>
      v1<CreatorApplication>("/creator_application", {
        method: "POST",
        body
      }),
    {
      onSuccess: (app) => {
        qc.setQueryData([QueryKeys.CREATOR_APPLICATION], app);
      }
    }
  );
};

export const useWithdrawCreatorApplication = () => {
  const qc = useQueryClient();
  return useMutation<unknown, ApiError, void>(
    () => v1("/creator_application", { method: "DELETE" }),
    { onSettled: () => qc.invalidateQueries(QueryKeys.CREATOR_APPLICATION) }
  );
};

// ── Creator account ────────────────────────────────────────────

/**
 * The creator's account. Resolves to null when the user isn't a creator
 * (403 without the role, 404 without an account) so pages can redirect.
 */
export const useCreator = (enabled = true) =>
  useQuery<CreatorSummary | null, ApiError>(
    [QueryKeys.CREATOR],
    async () => {
      try {
        return await v1<CreatorSummary>("/creator");
      } catch (e) {
        if (e instanceof ApiError && (e.status === 403 || e.status === 404))
          return null;
        throw e;
      }
    },
    { enabled, retry: retryTransient, staleTime: 30_000 }
  );

// ── Products ───────────────────────────────────────────────────

export const useCreatorProducts = (enabled = true) =>
  useQuery<CreatorProduct[], ApiError>(
    [QueryKeys.CREATOR_PRODUCTS],
    async () =>
      // 200 { products: [Product] }, newest first.
      (await v1<{ products: CreatorProduct[] }>("/creator/products"))
        ?.products || [],
    { enabled, retry: retryTransient, staleTime: 15_000 }
  );

export const useCreatorProduct = (id: number | null) =>
  useQuery<CreatorProduct, ApiError>(
    [QueryKeys.CREATOR_PRODUCT, id],
    () => v1<CreatorProduct>(`/creator/products/${id}`),
    { enabled: !!id, retry: retryTransient }
  );

export const useSaveCreatorProduct = () => {
  const qc = useQueryClient();
  return useMutation<
    CreatorProduct,
    ApiError,
    { id?: number | null; input: CreatorProductInput }
  >(
    ({ id, input }) =>
      id
        ? v1<CreatorProduct>(`/creator/products/${id}`, {
            method: "PATCH",
            body: input
          })
        : v1<CreatorProduct>("/creator/products", {
            method: "POST",
            body: input
          }),
    {
      onSuccess: (product) => {
        qc.setQueryData([QueryKeys.CREATOR_PRODUCT, product.id], product);
        qc.invalidateQueries(QueryKeys.CREATOR_PRODUCTS);
        qc.invalidateQueries(QueryKeys.CREATOR);
      }
    }
  );
};

export const useSubmitCreatorProduct = () => {
  const qc = useQueryClient();
  return useMutation<CreatorProduct, ApiError, number>(
    (id) =>
      v1<CreatorProduct>(`/creator/products/${id}/submit`, { method: "POST" }),
    {
      onSuccess: (product) => {
        if (product?.id)
          qc.setQueryData([QueryKeys.CREATOR_PRODUCT, product.id], product);
      },
      onSettled: () => {
        qc.invalidateQueries(QueryKeys.CREATOR_PRODUCTS);
        qc.invalidateQueries(QueryKeys.CREATOR_PRODUCT);
        qc.invalidateQueries(QueryKeys.CREATOR);
      }
    }
  );
};

export const useDeleteCreatorProduct = () => {
  const qc = useQueryClient();
  return useMutation<unknown, ApiError, number>(
    (id) => v1(`/creator/products/${id}`, { method: "DELETE" }),
    { onSettled: () => qc.invalidateQueries(QueryKeys.CREATOR_PRODUCTS) }
  );
};

// ── Sales and payouts ──────────────────────────────────────────

export interface SalesQuery {
  from: string;
  to: string;
  product_id?: number;
}

export const useCreatorSales = (q: SalesQuery, enabled = true) =>
  useQuery<CreatorSales, ApiError>(
    [QueryKeys.CREATOR_SALES, q.from, q.to, q.product_id ?? null],
    () =>
      v1<CreatorSales>("/creator/sales", {
        query: { from: q.from, to: q.to, product_id: q.product_id }
      }),
    { enabled, retry: retryTransient, keepPreviousData: true }
  );

export const useCreatorPayouts = (enabled = true) =>
  useQuery<Payout[], ApiError>(
    [QueryKeys.CREATOR_PAYOUTS],
    async () =>
      (await v1<{ payouts: Payout[] }>("/creator/payouts"))?.payouts || [],
    { enabled, retry: retryTransient }
  );

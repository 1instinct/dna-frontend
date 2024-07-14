import { QueryKey, UseQueryOptions, UseQueryResult } from "react-query";

declare module "react-query" {
  export declare function useQueries<
    TQueryFnData = unknown,
    TError = unknown,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey
  >(
    queries: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>[]
  ): UseQueryResult<TData, TError>[];
}

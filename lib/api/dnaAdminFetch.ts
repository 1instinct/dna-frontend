/**
 * Server-only calls to dna-admin's admin service endpoints
 * (`/api/v1/admin/*`), e.g. the M7 review-summary endpoints.
 *
 * Auth (contract › "M7 AI summaries › Service endpoints"): the admin service
 * user's API key goes in `X-Spree-Token` (from `DNA_ADMIN_SERVICE_TOKEN`),
 * replacing the storefront's public key, and no `Authorization` header is
 * sent. Built on `dnaFetch`, so URLs, JSON handling and `DnaApiError` match.
 */
import { dnaFetch, DnaFetchOptions } from "./dnaFetch";

export class DnaAdminConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DnaAdminConfigError";
    Object.setPrototypeOf(this, DnaAdminConfigError.prototype);
  }
}

export const isDnaAdminServiceConfigured = (): boolean =>
  Boolean(process.env.DNA_ADMIN_SERVICE_TOKEN);

/** Per-request timeout for service calls. */
const ADMIN_REQUEST_TIMEOUT_MS = 30_000;

export type DnaAdminFetchOptions = Omit<
  DnaFetchOptions,
  "auth" | "bearerToken" | "reviewToken" | "formData"
>;

export async function dnaAdminFetch<T>(
  path: string,
  options: DnaAdminFetchOptions = {}
): Promise<T> {
  if (typeof window !== "undefined") {
    throw new DnaAdminConfigError("dnaAdminFetch is server-only.");
  }
  const serviceToken = process.env.DNA_ADMIN_SERVICE_TOKEN;
  if (!serviceToken) {
    throw new DnaAdminConfigError("DNA_ADMIN_SERVICE_TOKEN is not set.");
  }
  const { headers, signal, ...rest } = options;
  return dnaFetch<T>(path, {
    ...rest,
    auth: "none",
    signal: signal ?? AbortSignal.timeout(ADMIN_REQUEST_TIMEOUT_MS),
    headers: {
      ...headers,
      // Overrides the storefront key dnaFetch sets by default.
      "X-Spree-Token": serviceToken
    }
  });
}

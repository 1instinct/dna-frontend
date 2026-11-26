import { useQuery } from "react-query";
import { QueryKeys } from "@hooks/queryKeys";
import { ApiError, v1 } from "../../lib/api/v1";
import type {
  DigitalSummary,
  LibraryItem,
  LibraryLink
} from "../../lib/library";

/** The signed-in user's library (GET /api/v1/library). */
export const useLibrary = (enabled = true) =>
  useQuery<LibraryItem[], ApiError>(
    [QueryKeys.LIBRARY],
    async () => (await v1<{ items: LibraryItem[] }>("/library"))?.items || [],
    {
      enabled,
      staleTime: 60_000,
      retry: (n, e) =>
        !(e instanceof ApiError && e.status < 500 && e.status > 0) && n < 2
    }
  );

/** Signed download links, short-lived: fetch right before use. */
export const getLibraryLinks = async (
  ownershipId: number,
  fileIds?: number[]
): Promise<LibraryLink[]> =>
  (
    await v1<{ links: LibraryLink[] }>(`/library/${ownershipId}/links`, {
      method: "POST",
      body: fileIds ? { file_ids: fileIds } : {}
    })
  )?.links || [];

/** Adds a free, claimable digital variant to the user's library. */
export const claimFree = (variantId: number) =>
  v1<LibraryItem>("/library/claim", {
    method: "POST",
    body: { variant_id: variantId }
  });

/** What a digital product includes (public). Null when it isn't digital. */
export const useDigitalSummary = (slug: string, enabled = true) =>
  useQuery<DigitalSummary | null, ApiError>(
    [QueryKeys.DIGITAL_SUMMARY, slug],
    async () => {
      try {
        return await v1<DigitalSummary>(
          `/products/${encodeURIComponent(slug)}/digital_summary`,
          { token: null }
        );
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    { enabled: enabled && !!slug, staleTime: 5 * 60_000, retry: false }
  );

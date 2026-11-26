// What the creator products API accepts, mirrored so the portal only offers
// what the server will do (dna-admin Creators::ProductWriter and the creator
// products controller):
//
// - PATCH: draft, changes_requested, approved, and rejected once live.
// - On a live product, name, description, price and categories apply at once;
//   files, the manifest and new preview media start a draft that needs review
//   (review_state goes back to draft).
// - Submit: from draft or changes_requested, with draft files or, on a live
//   product, changes waiting for review.
// - Delete: a draft that never went live.

import type { CreatorProduct } from "./types";

type P = Pick<CreatorProduct, "review_state" | "live_asset_version" | "asset">;

const isLive = (p: P) =>
  p.live_asset_version !== null && p.live_asset_version !== undefined;

export const canEdit = (p: P): boolean =>
  p.review_state === "draft" ||
  p.review_state === "changes_requested" ||
  p.review_state === "approved" ||
  (p.review_state === "rejected" && isLive(p));

/**
 * The server would accept a submit of the product as saved. A live product
 * only gets back to draft with changes waiting (a draft version, or preview
 * media the JSON can't show apart from the live ones), so that's enough.
 */
export const canSubmitNow = (p: P): boolean => {
  if (p.review_state !== "draft" && p.review_state !== "changes_requested")
    return false;
  if (p.asset?.status === "draft" && p.asset.files.length > 0) return true;
  return isLive(p);
};

/**
 * Saving these pending edits and then submitting would be accepted.
 * `asset`: files or manifest changed; `preview`: new preview media.
 */
export function willSubmit(
  p: P | null,
  changes: { asset: boolean; preview: boolean }
): boolean {
  if (!p) return true;
  if (!canEdit(p)) return false;
  if (p.review_state === "approved" || p.review_state === "rejected")
    return changes.asset || changes.preview;
  return canSubmitNow(p) || changes.asset || (isLive(p) && changes.preview);
}

export const canDelete = (p: P): boolean =>
  p.review_state === "draft" && !isLive(p);

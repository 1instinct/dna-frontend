import { reviewDraftKey } from "@lib/reviews";
import type { ComposerText } from "./types";

/**
 * Text-only composer drafts in localStorage (`dna_review_draft_<productId>`),
 * so a closed sheet or tab doesn't lose a half-written review. Photos and
 * ratings aren't kept. A draft started while editing remembers the review id
 * and is only restored for that review.
 */
export interface StoredDraft extends ComposerText {
  reviewId: number | null;
  savedAt: number;
}

/** Drafts older than this are ignored. */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const loadDraft = (
  productId: string | number,
  reviewId: number | null
): ComposerText | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(reviewDraftKey(productId));
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<StoredDraft>;
    if (!draft || typeof draft !== "object") return null;
    if ((draft.reviewId ?? null) !== reviewId) return null;
    if (draft.savedAt && Date.now() - draft.savedAt > MAX_AGE_MS) return null;
    return {
      title: typeof draft.title === "string" ? draft.title : "",
      body: typeof draft.body === "string" ? draft.body : "",
      displayName:
        typeof draft.displayName === "string" ? draft.displayName : ""
    };
  } catch {
    return null;
  }
};

export const saveDraft = (
  productId: string | number,
  reviewId: number | null,
  text: ComposerText
) => {
  if (typeof window === "undefined") return;
  try {
    const empty = !text.title.trim() && !text.body.trim();
    if (empty) {
      window.localStorage.removeItem(reviewDraftKey(productId));
      return;
    }
    const draft: StoredDraft = { ...text, reviewId, savedAt: Date.now() };
    window.localStorage.setItem(
      reviewDraftKey(productId),
      JSON.stringify(draft)
    );
  } catch {
    // Storage full or blocked; drafts are a convenience.
  }
};

export const clearDraft = (productId: string | number) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(reviewDraftKey(productId));
  } catch {
    // ignore
  }
};

// The product editor's state, and the conversions to and from the creator
// products API (dna-admin Creators::ProductWriter). Pure: the wizard holds a
// ProductDraft plus the upload list, and turns them into a request body here.
//
// The manifest is app-defined (DigitalAssets.config.manifest_validators on the
// backend). The generic editor never writes one: a new product sends an empty
// manifest and an edit leaves the stored one as it is. A fork that needs a
// manifest builds it in its own editor and passes it to draftToInput.

import type { DigitalKind } from "../digitalKinds";
import type { CreatorProduct, CreatorProductInput } from "./types";

export interface DraftFile {
  key: string;
  name: string;
  size: number;
  status: "queued" | "uploading" | "done" | "error";
  signedId?: string;
  existingId?: number;
}

export interface ProductDraft {
  kind: DigitalKind | null;
  name: string;
  description: string;
  price: string;
  taxonIds: number[];
}

export const emptyDraft = (kind: DigitalKind | null = null): ProductDraft => ({
  kind,
  name: "",
  description: "",
  price: "",
  taxonIds: []
});

export function draftFromProduct(p: CreatorProduct): ProductDraft {
  return {
    kind: p.kind || null,
    name: p.name || "",
    description: p.description || "",
    price: p.price === null || p.price === undefined ? "" : String(p.price),
    taxonIds: p.taxon_ids || []
  };
}

const usable = (files: DraftFile[]) =>
  files.filter((f) => f.status === "done" && (f.signedId || f.existingId));

/**
 * The lowest price a creator may set. Mirrors the backend's default
 * Creators.config.min_price; the backend has the last word (422 on price).
 */
export const MIN_PRICE = 0.5;
export const MAX_PRICE = 999;

/** The upload list differs from the asset's files as loaded. */
export function filesChanged(
  files: DraftFile[],
  originalFileIds: number[] | null
): boolean {
  const ready = usable(files);
  if (originalFileIds === null) return ready.length > 0;
  const kept = ready
    .filter((f) => !f.signedId && f.existingId !== undefined)
    .map((f) => f.existingId as number);
  return (
    ready.some((f) => f.signedId) ||
    kept.length !== originalFileIds.length ||
    !kept.every((id) => originalFileIds.includes(id))
  );
}

export function draftToInput(
  d: ProductDraft,
  files: DraftFile[],
  {
    originalFileIds,
    previewImageSignedId,
    previewAudioSignedId,
    manifest
  }: {
    /** The asset's file ids as loaded; null for a new product. */
    originalFileIds: number[] | null;
    previewImageSignedId?: string | null;
    previewAudioSignedId?: string | null;
    /**
     * A manifest to send. The server treats any manifest (or kind) in a PATCH
     * as a new version for review, so leave it out unless it changed. A new
     * product always sends one (empty when not given).
     */
    manifest?: Record<string, any>;
  }
): CreatorProductInput {
  const ready = usable(files);
  const isNew = originalFileIds === null;
  const input: CreatorProductInput = {
    name: d.name.trim(),
    description: d.description.trim(),
    price: Math.round(Number(d.price || 0) * 100) / 100,
    taxon_ids: d.taxonIds
  };
  if (isNew) {
    input.kind = d.kind as DigitalKind;
    input.manifest = manifest || {};
  } else if (manifest) {
    input.manifest = manifest;
  }
  if (previewImageSignedId)
    input.preview_image_signed_id = previewImageSignedId;
  if (previewAudioSignedId)
    input.preview_audio_signed_id = previewAudioSignedId;

  const added = ready
    .filter((f) => f.signedId)
    .map((f) => f.signedId as string);
  const kept = ready
    .filter((f) => !f.signedId && f.existingId !== undefined)
    .map((f) => f.existingId as number);
  if (filesChanged(files, originalFileIds) || isNew) {
    input.files = added;
    if (originalFileIds !== null) input.keep_file_ids = kept;
  }
  return input;
}

export interface StepErrors {
  kind: string[];
  details: string[];
  files: string[];
  preview: string[];
}

export function stepErrors(d: ProductDraft, files: DraftFile[]): StepErrors {
  const details: string[] = [];
  if (!d.name.trim()) details.push("Name the product.");
  const price = Number(d.price);
  if (d.price.trim() === "" || !Number.isFinite(price) || price < MIN_PRICE)
    details.push(`Price must be at least ${MIN_PRICE.toFixed(2)}.`);
  else if (price > MAX_PRICE)
    details.push(`Price must be ${MAX_PRICE} or less.`);

  const fileErrors: string[] = [];
  if (files.some((f) => f.status === "queued" || f.status === "uploading"))
    fileErrors.push("Wait for uploads to finish.");
  if (files.some((f) => f.status === "error"))
    fileErrors.push("Retry or remove the files that failed.");
  if (!usable(files).length) fileErrors.push("Add at least one file.");

  return {
    kind: d.kind ? [] : ["Pick what you're making."],
    details,
    files: fileErrors,
    preview: []
  };
}

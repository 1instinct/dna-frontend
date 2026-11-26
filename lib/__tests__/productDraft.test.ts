import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { CreatorProduct } from "../creator/types";
import {
  draftFromProduct,
  draftToInput,
  DraftFile,
  emptyDraft,
  filesChanged,
  stepErrors
} from "../creator/productDraft";

const product = (over: Partial<CreatorProduct> = {}): CreatorProduct => ({
  id: 7,
  slug: "field-guide",
  name: "Field Guide",
  description: "A guide",
  price: "9.99",
  currency: "USD",
  kind: "ebook",
  review_state: "approved",
  review_note: null,
  taxon_ids: [3],
  preview: { image_url: null, audio_url: null },
  asset: {
    id: 1,
    version: 2,
    status: "published",
    manifest: { edition: 2 },
    files: [
      {
        id: 11,
        filename: "guide.json",
        byte_size: 1000,
        content_type: "application/json"
      }
    ]
  },
  live_asset_version: 2,
  sales_count: 4,
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-02T00:00:00Z",
  ...over
});

const existing: DraftFile = {
  key: "existing-11",
  name: "guide.json",
  size: 1000,
  status: "done",
  existingId: 11
};
const uploaded: DraftFile = {
  key: "u1",
  name: "cover.png",
  size: 500,
  status: "done",
  signedId: "sig-1"
};

describe("draftFromProduct", () => {
  test("restores kind and details", () => {
    assert.deepEqual(draftFromProduct(product()), {
      kind: "ebook",
      name: "Field Guide",
      description: "A guide",
      price: "9.99",
      taxonIds: [3]
    });
  });

  test("a product without an asset has no kind yet", () => {
    assert.equal(
      draftFromProduct(product({ kind: null, asset: null })).kind,
      null
    );
  });
});

describe("draftToInput", () => {
  const d = draftFromProduct(product());

  test("leaves files, kind and manifest out when nothing about the asset changed", () => {
    const input = draftToInput(d, [existing], { originalFileIds: [11] });
    assert.deepEqual(input, {
      name: "Field Guide",
      description: "A guide",
      price: 9.99,
      taxon_ids: [3]
    });
  });

  test("sends new signed ids plus the kept existing files when they change", () => {
    const input = draftToInput(d, [existing, uploaded], {
      originalFileIds: [11]
    });
    assert.deepEqual(input.files, ["sig-1"]);
    assert.deepEqual(input.keep_file_ids, [11]);
  });

  test("removing a file sends an empty keep list", () => {
    const input = draftToInput(d, [uploaded], { originalFileIds: [11] });
    assert.deepEqual(input.files, ["sig-1"]);
    assert.deepEqual(input.keep_file_ids, []);
  });

  test("a new product sends its kind, an empty manifest and its files", () => {
    const input = draftToInput(
      { ...emptyDraft("ebook"), name: " New ", price: "4.999" },
      [uploaded],
      { originalFileIds: null, previewImageSignedId: "img-1" }
    );
    assert.equal(input.kind, "ebook");
    assert.deepEqual(input.manifest, {});
    assert.equal(input.name, "New");
    assert.equal(input.price, 5);
    assert.deepEqual(input.files, ["sig-1"]);
    assert.equal(input.keep_file_ids, undefined);
    assert.equal(input.preview_image_signed_id, "img-1");
  });

  test("an update sends a manifest only when one is given", () => {
    const input = draftToInput(d, [existing], {
      originalFileIds: [11],
      manifest: { edition: 3 }
    });
    assert.deepEqual(input.manifest, { edition: 3 });
    assert.equal(input.kind, undefined);
  });

  test("files still uploading or failed don't count", () => {
    const busy: DraftFile = { ...uploaded, status: "uploading" };
    assert.equal(filesChanged([existing, busy], [11]), false);
  });
});

describe("stepErrors", () => {
  test("details need a name and a price of at least 0.50", () => {
    const e = stepErrors({ ...emptyDraft("ebook"), price: "0.2" }, [uploaded]);
    assert.deepEqual(e.details, [
      "Name the product.",
      "Price must be at least 0.50."
    ]);
  });

  test("a kind is needed first", () => {
    assert.deepEqual(stepErrors(emptyDraft(), []).kind, [
      "Pick what you're making."
    ]);
  });

  test("files are needed, finished and without failures", () => {
    const d = { ...emptyDraft("ebook"), name: "A", price: "1" };
    assert.deepEqual(stepErrors(d, []).files, ["Add at least one file."]);
    assert.ok(
      stepErrors(d, [{ ...uploaded, status: "uploading" }]).files.includes(
        "Wait for uploads to finish."
      )
    );
    assert.ok(
      stepErrors(d, [
        uploaded,
        { ...uploaded, key: "x", status: "error" }
      ]).files.includes("Retry or remove the files that failed.")
    );
    assert.deepEqual(stepErrors(d, [uploaded]).files, []);
  });
});
